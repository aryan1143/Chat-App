import { Server } from "socket.io";
import http from "node:http";
import express from "express";
import { config } from "dotenv";
import { createClient } from "redis";
import { updateLastOnline, updateMessageStatus } from "./utils.js";

config();

const redisUrl =
  process.env.REDIS_HOST && process.env.REDIS_PORT
    ? `${(process.env.REDIS_TLS || "false").toLowerCase() === "true" ? "rediss" : "redis"}://${encodeURIComponent(process.env.REDIS_USERNAME || "default")}:${encodeURIComponent(process.env.REDIS_PASSWORD || "")}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    : process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL or REDIS_HOST/REDIS_PORT must be configured");
}

const redisClient = createClient({
  url: redisUrl,
  socket: {
    family: 4,
  },
});

redisClient.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

await redisClient.connect();
console.log("✅ Redis connected");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});

export async function getSocketIds(userId) {
  return await redisClient.sMembers(`user:${userId}:sockets`);
}

export async function isOnline(userId) {
  return await redisClient.sIsMember("onlineUsers", userId);
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

  await redisClient.sAdd(`user:${userId}:sockets`, socket.id);
  await redisClient.sAdd("onlineUsers", userId);
  await redisClient.set(`socket:${socket.id}`, userId);

  const onlineUsers = new Set(await redisClient.sMembers("onlineUsers"));
  const onlineFriends = friendsIdList.filter((id) => onlineUsers.has(id));

  socket.emit("getOnlineFriends", onlineFriends);

  for (const id of friendsIdList) {
    const friendSockets = await redisClient.sMembers(`user:${id}:sockets`);

    for (const sId of friendSockets) {
      io.to(sId).emit("friendOnline", userId);
    }
  }

  socket.on("disconnect", async () => {
    const remaining = await redisClient.sCard(`user:${userId}:sockets`);
    if (remaining === 1) {
      await redisClient.del(`user:${userId}:sockets`);
      await redisClient.del(`socket:${socket.id}`);
      await redisClient.sRem("onlineUsers", userId);

      const lastOnline = await updateLastOnline(userId);

      for (const id of friendsIdList) {
        const friendSockets = await redisClient.sMembers(`user:${id}:sockets`);

        for (const sId of friendSockets) {
          io.to(sId).emit("friendOffline", { userId, lastOnline });
        }
      }
    } else {
      await redisClient.sRem(`user:${userId}:sockets`, socket.id);
      await redisClient.del(`socket:${socket.id}`);
    }
  });

  socket.on("typing", async (query) => {
    const receiverSockets = await redisClient.sMembers(
      `user:${query.to}:sockets`,
    );
    receiverSockets.forEach((sId) => {
      io.to(sId).emit("typing", query);
    });
  });

  socket.on("stopTyping", async (query) => {
    const receiverSockets = await redisClient.sMembers(
      `user:${query.to}:sockets`,
    );
    receiverSockets.forEach((sId) => {
      io.to(sId).emit("stopTyping", query);
    });
  });

  socket.on("messageReceived", async (query) => {
    try {
      await updateMessageStatus(query);
    } catch (error) {
      console.log("Error in socket message received: ", error);
    }
  });
});

export { io, app, server };
