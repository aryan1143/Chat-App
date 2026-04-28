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
const onlineUsersMap = new Map();

//helper function to get socketIds by userId
export function getSocketIds(userId) {
  return onlineUsersMap.get(userId);
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  //making sure the friendsIdList is an array
  let friendsIdList = socket.handshake.query.friendsIdList || [];
  if (typeof friendsIdList === "string") {
    friendsIdList = friendsIdList.split(",");
  }

  if (!userId) return;

  //adding user with socket in the onlineUsersMap
  const userSockets = onlineUsersMap.get(userId) || [];
  onlineUsersMap.set(userId, [...userSockets, socket.id]);

  //function to get friends status if they are online or offline
  const getFriendsStatus = () =>
    friendsIdList.filter((id) => onlineUsersMap.has(id));

  //emiting all the online friends that this user is now online
  friendsIdList.forEach((id) => {
    const friendSockets = onlineUsersMap.get(id) || [];

    friendSockets.forEach((socket) => {
      io.to(socket).emit("friendOnline", userId);
    });
  });

  //emiting the user that which of his friends are online
  socket.emit("getOnlineFriends", getFriendsStatus());

  socket.on("disconnect", () => {
    const userSockets = onlineUsersMap.get(userId) || [];

    const updatedSockets = userSockets.filter((id) => id !== socket.id);

    if (updatedSockets.length === 0) {
      onlineUsersMap.delete(userId);

      //emiting all the online friends that this user is now offline
      friendsIdList.forEach((id) => {
        const friendSockets = onlineUsersMap.get(id) || [];

        friendSockets.forEach((socket) => {
          io.to(socket).emit("friendOffline", userId);
        });
      });
    } else {
      onlineUsersMap.set(userId, updatedSockets);
    }
  });
});

export { io, app, server };
