import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    clientMsgId: {
      type: String,
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      default: "sent",
      enum: ["sent", "received", "seen"],
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    receivedAt: {
      type: Date,
    },
    seenAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Message = model("Message", messageSchema);

export default Message;
