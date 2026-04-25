import Connections from "../models/connections.model.js";
import User from "../models/user.model.js";

//function to find a users via query (email or name)
export const findUsers = async (req, res) => {
  const { query } = req.query;
  const requesterID = req.user?._id;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  try {
    // escape regex special chars (important)
    const searchTerm = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { fullName: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("_id email fullName profilePic")
      .limit(10)
      .lean();

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const recipientIDs = users.map((user) => user._id);

    //cheking for existing connection for requested users
    const existingConnections = await Connections.find({
      $or: [
        { requesterID, recipientID: { $in: recipientIDs } },
        { requesterID: { $in: recipientIDs }, recipientID: requesterID },
      ],
    });

    // connection map of the existing connections
    const connectionMap = new Map();
    existingConnections.forEach((c) => {
      const otherUserId = c.requesterID.equals(requesterID)
        ? c.recipientID.toString()
        : c.requesterID.toString();

      connectionMap.set(otherUserId, c);
    });

    //modifing users list by adding connection status to know if user already have an connection or not
    const finalUsersList = users.map((user) => {
      if (existingConnections.length === 0)
        return { ...user, connectionStatus: "none" };

      const connection = connectionMap.get(user._id.toString());

      if (!connection) return { ...user, connectionStatus: "none" };

      if (connection.status === "accepted")
        return { ...user, connectionStatus: "friends" };

      if (connection.requesterID.equals(requesterID)) {
        return { ...user, connectionStatus: "sent" };
      } else {
        return { ...user, connectionStatus: "received" };
      }
    });

    return res.status(200).json(finalUsersList);
  } catch (error) {
    console.log("Error in findUsers connection-controller:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

//function to send friend reqest
export const sendRequest = async (req, res) => {
  const requesterID = req.user?._id;
  const recipientID = req.params?.id;
  if (!recipientID)
    return res.status(400).json({ message: "Recipient Id is required" });

  try {
    //finding the recipient from User model (DB)
    const recipientData = await User.findById(recipientID).select("-password");
    if (!recipientData)
      return res.status(404).json({ message: "User not found" });

    if (requesterID.toString() === recipientID) {
      return res
        .status(400)
        .json({ message: "You cannot send request to yourself" });
    }

    const existingConnection = await Connections.findOne({
      $or: [
        { requesterID, recipientID },
        { requesterID: recipientID, recipientID: requesterID },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({ message: "Request already exists" });
    }

    //creating new connection request with status "pending"
    const newConnection = await Connections.create({
      requesterID,
      recipientID,
      status: "pending",
    });

    //todo: socket.io code will go here

    res.status(201).json(newConnection);
  } catch (error) {
    console.log("Error in sendRequest connection-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

//function to accept friend reqest
export const acceptRequest = async (req, res) => {
  const { connectionID } = req.params;
  const userId = req.user?._id;

  if (!connectionID) {
    return res.status(400).json({ message: "Connection ID is required" });
  }

  try {
    const connection = await Connections.findById(connectionID);

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    if (!connection.recipientID.equals(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (connection.status === "accepted") {
      return res.status(400).json({ message: "Request already accepted" });
    }

    connection.status = "accepted";
    await connection.save();

    //todo: socket.io code will go here

    return res.status(200).json(connection.toObject());
  } catch (error) {
    console.log("Error in acceptRequest connection-controller:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

//function to reject friend reqest
export const rejectRequest = async (req, res) => {
  const { connectionID } = req.params;
  const userId = req.user?._id;

  if (!connectionID) {
    return res.status(400).json({ message: "Connection ID is required" });
  }

  try {
    const connection = await Connections.findById(connectionID);

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    const isRecipient = connection.recipientID.equals(userId);
    const isRequester = connection.requesterID.equals(userId);

    if (!isRecipient && !isRequester) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({ message: "Invalid request state" });
    }

    await connection.deleteOne();

    //todo: socket.io code will go here

    return res.status(200).json({ message: "Request rejected successfully" });
  } catch (error) {
    console.log("Error in rejectRequest connection-controller:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

//function to delete a friend
export const deleteFriend = async (req, res) => {
  const otherUserId = req.params?.id;
  const userId = req.user?._id;

  if (!otherUserId) {
    return res.status(400).json({ message: "Other user's ID is required" });
  }

  try {
    const connection = await Connections.findOne({
      $or: [
        { requesterID: otherUserId, recipientID: userId },
        { requesterID: userId, recipientID: otherUserId },
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    const isRecipient = connection.recipientID.equals(userId);
    const isRequester = connection.requesterID.equals(userId);

    if (!isRecipient && !isRequester) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (connection.status !== "accepted") {
      return res.status(400).json({ message: "Invalid request state" });
    }

    await connection.deleteOne();

    //todo: socket.io code will go here

    return res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.log("Error in deleteFriend connection-controller:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};
