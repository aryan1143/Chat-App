import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import { getSocketIds, io } from "./socket.js";
import User from "../models/user.model.js";
import admin from "./firebaseAdmin.js";

//function to generate JWT of user obj
export function generateJWT(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, //Miliseconds
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  return token;
}

export async function updateMessageStatus(messageData) {
  const { _id, sentAt, receivedAt, seenAt, status } = messageData;
  if (!_id || !status || (!sentAt && !receivedAt && !seenAt))
    return new Error("Message data is required to update message status");
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      _id,
      {
        status,
        sentAt: sentAt || null,
        receivedAt: receivedAt || null,
        seenAt: seenAt || null,
      },
      { returnDocument: "after" },
    ).populate({
      path: "repliedTo",
      select: "text image",
    });
    const { senderId } = updatedMessage;
    const senderSocketIds = await getSocketIds(senderId);
    senderSocketIds.forEach((sId) => {
      io.to(sId).emit("receiverReceivedMessage", updatedMessage);
    });
    return updatedMessage;
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateLastOnline(userId) {
  if (!userId) {
    console.warn("⚠️ updateLastOnline called with undefined userId");
    return;
  }
  try {
    const now = Date.now();
    await User.findByIdAndUpdate(userId, {
      lastOnline: now,
    });
    return now;
  } catch (error) {
    console.error("❌ Error updating lastOnline for user:", userId, error);
    throw new Error(error);
  }
}

//sending push notification using firebase sdk
export const sendPushNotification = async (
  fcmToken,
  senderName,
  messageText,
) => {
  try {
    const message = {
      token: fcmToken,
      data: { type: "chat", title: senderName, body: messageText },
    };
    const response = await admin.messaging().send(message);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
