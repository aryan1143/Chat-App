import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import imagekit from "../lib/imagekit.js";

//controller to get all users-data excluding loggedInUser
export const getUsers = async (req, res) => {
  const loggedInUserId = req.user._id;
  try {
    //getting all users from DB in descending order excluding loggedInUser
    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUser message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};

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
    });

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

  const { text, image } = req.body;

  if (!text && !image) {
    return res.status(400).json({ message: "Text or Image is required" });
  }

  try {
    const newMessage = new Message({
      senderId: myId,
      receiverId,
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

    //todo: realtime functionality will go here-----

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage message-controller:", error.message);
    res.status(500).json({ message: "Internal server error!" });
  }
};
