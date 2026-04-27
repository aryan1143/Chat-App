import { Server } from "socket.io";
import http from "node:http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

//online users object userId => [socketIds]
const onlineUsers = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  //adding user to online users list with all sockets
  if (!onlineUsers[userId]) onlineUsers[userId] = [];
  onlineUsers[userId].push(socket.id);
  io.emit("getOnlineUsers", Object.keys(onlineUsers));

  socket.on("disconnect", () => {
    //removing offline user from online users list with each ofline socket
    onlineUsers[userId] = onlineUsers[userId].filter((id) => id !== socket.id);
    if (onlineUsers[userId].length === 0) delete onlineUsers[userId];
    io.emit("getOnlineUsers", Object.keys(onlineUsers));
  });
});

export { io, app, server };
