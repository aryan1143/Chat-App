import mongoose from "mongoose";

//conections schema for friends
const connectionsSchema = new mongoose.Schema(
  {
    requesterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: "String",
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Connections = mongoose.model("Connection", connectionsSchema);

export default Connections;
