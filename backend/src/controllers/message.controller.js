import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import imagekit from "../lib/imagekit.js";
import { getSocketIds, io } from "../lib/socket.js";

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

//controller if user received message sent by sender
export const messageReceived = async (req, res) => {};
