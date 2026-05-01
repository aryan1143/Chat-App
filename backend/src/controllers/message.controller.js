import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import imagekit from "../lib/imagekit.js";
import { getSocketIds, io } from "../lib/socket.js";
import Connections from "../models/connections.model.js";

//controller to get messages with a specific user
export const getMessages = async (req, res) => {
  const userToChatId = req.params.id;
  const myId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).lean();

    const messageUpdates = [];

    for (const message of messages) {
      if (message.status === "sent" || message.status === "received") {
        messageUpdates.push({
          updateOne: {
            filter: { _id: message._id, receiverId: myId },
            update: { $set: { status: "seen" } },
          },
        });

        const senderSocketIds = await getSocketIds(message.senderId.toString());

        for (const sId of senderSocketIds) {
          io.to(sId).emit("receiverReceivedMessage", {
            ...message,
            status: "seen",
          });
        }
      }
    }

    if (messageUpdates.length > 0) {
      await Message.bulkWrite(messageUpdates);
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

//controller to send message to a specific user
export const sendMessage = async (req, res) => {
  const receiverId = req.params.id;
  const myId = req.user._id;

  const { text, image, clientMsgId } = req.body;

  if (!text && !image) {
    return res.status(400).json({ message: "Text or Image is required" });
  }

  try {
    const newMessage = new Message({
      senderId: myId,
      receiverId,
      clientMsgId,
      status: "sent",
    });

    //uploading image url to cloudinary and adding the url to newMessage obj--
    if (image) {
      const uploadResponse = await imagekit.upload({
        file: image,
        fileName: `image_${Date.now()}.jpg`,
        folder: "/messages/",
        useUniqueFileName: true,
      });
      newMessage.image = uploadResponse.url;
    }

    if (text) {
      newMessage.text = text;
    }

    await newMessage.save();

    //emiting the message if user is online
    const receiverSocketIds = await getSocketIds(receiverId.toString());
    if (receiverSocketIds?.length >= 1) {
      receiverSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessageReceived", newMessage);
      });
    }

    //emitting the message to the sender
    const senderSocketIds = await getSocketIds(myId.toString());
    if (senderSocketIds?.length >= 1) {
      senderSocketIds.forEach((socketId) => {
        io.to(socketId).emit("newMessageSent", newMessage);
      });
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

//controller to edit a specific message via message id
export const editMessage = async (req, res) => {
  const messageId = req.params?.id;
  const { text } = req.body;

  if (!messageId)
    return res.status(400).json({ message: "message id is required" });
  if (!text)
    return res
      .status(400)
      .json({ message: "text is required to edit the message" });

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text, status: "sent" },
      { returnDocument: "after" },
    ).lean();

    if (!updatedMessage)
      return res.status(404).json({ message: "message not found" });

    //emiting to the receiver that the msg is edited in real time using socket.io
    const receiverSocketIds = await getSocketIds(
      updatedMessage?.receiverId?.toString(),
    );
    receiverSocketIds.forEach((socketId) => {
      io.to(socketId).emit("messageEdited", updatedMessage);
    });

    //emiting to the sender that message edited in real time using socket.io
    const senderSocketIds = await getSocketIds(
      updatedMessage?.senderId?.toString(),
    );
    senderSocketIds.forEach((socketId) => {
      io.to(socketId).emit("messageEditedSucessfully", updatedMessage);
    });

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.log("Error in edit message message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

//controller to delete a specific message via message id
export const deleteMessage = async (req, res) => {
  const messageId = req.params?.id;

  if (!messageId)
    return res
      .status(400)
      .json({ message: "message id is required to delete" });

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage)
      return res.status(404).json({ message: "message not found" });

    //emiting to the receiver in real time using socket.io
    const receiverSocketIds = await getSocketIds(
      deletedMessage?.receiverId?.toString(),
    );
    receiverSocketIds.forEach((sId) => {
      io.to(sId).emit("messageDeleted", deletedMessage);
    });

    res.status(204);
  } catch (error) {
    console.log("Error in delete message message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

//controller to get unread messages
export const getNewMessages = async (req, res) => {
  const userId = req.user._id;

  try {
    const connections = await Connections.find({
      $or: [
        { requesterID: userId, status: "accepted" },
        { recipientID: userId, status: "accepted" },
      ],
    }).lean();

    const friendsIds = connections.map((con) => {
      if (con.requesterID === userId) return con.recipientID;
      return con.requesterID;
    });

    const newMessages = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          senderId: { $in: friendsIds },
          status: { $in: ["sent", "received"] },
        },
      },
      {
        $sort: {
          senderId: 1,
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$senderId",
          latestDoc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestDoc" },
      },
    ]);

    if (!newMessages || newMessages.length === 0)
      return res.status(204).json({ message: "No new message found" });

    res.status(200).json(newMessages);
  } catch (error) {
    console.log("Error in getNewMessages message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};
