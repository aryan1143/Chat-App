import { Server } from "socket.io";
import http from "node:http";
import express from "express";
import { updateLastOnline, updateMessageStatus } from "./utils.js";
import Redis from "ioredis";
import { config } from "dotenv";

config();

const redisClient = new Redis(process.env.REDIS_URL, {
  tls: {},
  family: 4,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});

// helper to getSocketIds
export async function getSocketIds(userId) {
  return await redisClient.smembers(`user:${userId}:sockets`);
}

// helper to check if user is online
export async function isOnline(userId) {
  return await redisClient.sismember("onlineUsers", userId);
}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  let friendsIdList = socket.handshake.query.friendsIdList || [];
  if (typeof friendsIdList === "string") {
    friendsIdList = friendsIdList.split(",");
  }

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  // storing user ids and socket ids
  await redisClient.sadd(`user:${userId}:sockets`, socket.id);
  await redisClient.sadd("onlineUsers", userId);
  await redisClient.set(`socket:${socket.id}`, userId);

  // getting all online friends of user
  const onlineUsers = new Set(await redisClient.smembers("onlineUsers"));
  const onlineFriends = friendsIdList.filter((id) => onlineUsers.has(id));

  socket.emit("getOnlineFriends", onlineFriends);

  // notifying all friends that user is online
  for (const id of friendsIdList) {
    const friendSockets = await redisClient.smembers(`user:${id}:sockets`);

    for (const sId of friendSockets) {
      io.to(sId).emit("friendOnline", userId);
    }
  }

  socket.on("disconnect", async () => {
    const remaining = await redisClient.scard(`user:${userId}:sockets`);
    if (remaining === 1) {
      await redisClient.del(`user:${userId}:sockets`);
      await redisClient.del(`socket:${socket.id}`);
      await redisClient.srem("onlineUsers", userId);

      if (userId) {
        const lastOnline = await updateLastOnline(userId);

        // notifing all friedns that this user is now offline
        for (const id of friendsIdList) {
          const friendSockets = await redisClient.smembers(
            `user:${id}:sockets`,
          );

          for (const sId of friendSockets) {
            io.to(sId).emit("friendOffline", { userId, lastOnline });
          }
        }
      } else {
        console.warn("⚠️ User disconnected but userId is undefined");
      }
    } else {
      //removing the socket of user
      await redisClient.srem(`user:${userId}:sockets`, socket.id);
      await redisClient.del(`socket:${socket.id}`);
    }
  });

  socket.on("typing", async (query) => {
    const receiverSockets = await redisClient.smembers(
      `user:${query.to}:sockets`,
    );
    receiverSockets.forEach((sId) => {
      io.to(sId).emit("typing", query);
    });
  });

  socket.on("stopTyping", async (query) => {
    const receiverSockets = await redisClient.smembers(
      `user:${query.to}:sockets`,
    );
    receiverSockets.forEach((sId) => {
      io.to(sId).emit("stopTyping", query);
    });
  });

  socket.on("messageReceived", async (query) => {
    try {
      const updatedMessage = await updateMessageStatus(query);
    } catch (error) {
      console.log("Error in socket message received: ", error);
    }
  });
});

export { io, app, server };
