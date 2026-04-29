import { Server } from "socket.io";
import http from "node:http";
import express from "express";
import { createClient } from "redis";
import { updateMessageStatus } from "./utils.js";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.log("Redis Error:", err));

await redisClient.connect();
console.log("Redis connected");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

//clearing current db in start of the server
await redisClient.flushDb();

// helper to getSocketIds
export async function getSocketIds(userId) {
  return await redisClient.sMembers(`user:${userId}:sockets`);
}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;

  let friendsIdList = socket.handshake.query.friendsIdList || [];
  if (typeof friendsIdList === "string") {
    friendsIdList = friendsIdList.split(",");
  }

  if (!userId) return;

  // storing user ids and socket ids
  await redisClient.sAdd(`user:${userId}:sockets`, socket.id);
  await redisClient.sAdd("onlineUsers", userId);
  await redisClient.set(`socket:${socket.id}`, userId);

  // getting all online friends of user
  const onlineUsers = new Set(await redisClient.sMembers("onlineUsers"));
  const onlineFriends = friendsIdList.filter((id) => onlineUsers.has(id));

  socket.emit("getOnlineFriends", onlineFriends);

  // notifying all friends that user is online
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
      await redisClient.sRem("onlineUsers", userId);

      // notifing all friedns that this user is now offline
      for (const id of friendsIdList) {
        const friendSockets = await redisClient.sMembers(`user:${id}:sockets`);

        for (const sId of friendSockets) {
          io.to(sId).emit("friendOffline", userId);
        }
      }
    } else {
      //removing the socket of user
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
      const updatedMessage = await updateMessageStatus(query);
    } catch (error) {
      console.log("Error in socket message received: ", error);
    }
  });
});

export { io, app, server };
