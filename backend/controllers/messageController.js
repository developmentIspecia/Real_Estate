import Message from "../models/Message.js";
import User from "../models/User.js";

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) return res.status(400).json({ message: "Message cannot be empty" });

    // Determine roomId
    // For admin replying to a user, use that user's room
    const roomId = req.user.isAdmin && userId ? `user_${userId}` : `user_${req.user._id}`;

    const newMessage = new Message({
      roomId,
      sender: req.user._id,
      message,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Get all messages for the current user
export const getMessages = async (req, res) => {
  try {
    const roomId = `user_${req.user._id}`;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email isAdmin");

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// Admin: get all users who have chats
export const getAllUserChats = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });

    // get unique roomIds
    const rooms = await Message.distinct("roomId");

    // extract userId from roomId
    const userIds = rooms.map(r => r.replace("user_", ""));

    // fetch user info
    const users = await User.find({ _id: { $in: userIds } }).select("name email");

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user chats" });
  }
};

// Admin: get messages of a specific user
export const getUserMessages = async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { userId } = req.params;
    const roomId = `user_${userId}`;

    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate("sender", "name email isAdmin");

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};
