import express from "express";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Get all messages (admin view)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const messages = await Chat.find()
      .populate("sender", "name email role profilePhoto")
      .populate("receiver", "name email role profilePhoto")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get a list of unique users who have chatted with the current user
router.get("/active-conversations", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Find all unique partners who have exchanged messages with this user
    const partners = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$read", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Populate user details for each partner
    const result = await Promise.all(
      partners.map(async (p) => {
        const userData = await User.findById(p._id).select("name email role profilePhoto");
        if (!userData) return null;
        return {
          id: userData._id,
          name: userData.name,
          role: userData.role,
          profilePhoto: userData.profilePhoto,
          lastMessage: p.lastMessage,
          timestamp: p.timestamp,
          unreadCount: p.unreadCount,
        };
      })
    );

    res.json(result.filter(item => item !== null));
  } catch (err) {
    console.error("Fetch active conversations error:", err);
    res.status(500).json({ error: "Failed to fetch active conversations" });
  }
});

// Get a conversation between the current user and a specific partner
router.get("/conversation/:partnerId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.params.partnerId;

    const messages = await Chat.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    })
      .populate("sender", "name email role profilePhoto")
      .populate("receiver", "name email role profilePhoto")
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Fetch conversation error:", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Send a message
router.post("/", authMiddleware, async (req, res) => {
  const { message, receiverId } = req.body;

  if (!message || !receiverId) {
    return res.status(400).json({ error: "Message and receiverId are required" });
  }

  try {
    const senderId = req.user.id;

    // Verify receiver exists
    const targetUser = await User.findById(receiverId);
    if (!targetUser) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const chatMessage = new Chat({
      sender: senderId,
      receiver: receiverId,
      message,
      timestamp: new Date(),
      role: req.user.role || "user",
    });

    await chatMessage.save();

    // Populate sender info before emitting
    await chatMessage.populate("sender", "name email role");

    // Broadcast the new message in real-time to both the sender and receiver rooms
    req.io.to(senderId.toString()).emit("receiveMessage", chatMessage);
    req.io.to(receiverId.toString()).emit("receiveMessage", chatMessage);

    // If sending to an admin, you can also optionally notify the general 'admin' room
    if (targetUser.role === 'admin' || targetUser.role === 'agent') {
      req.io.to("admin").emit("receiveMessage", chatMessage);
    }

    res.json(chatMessage);
  } catch (err) {
    console.error("Chat send error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark messages as read
router.put("/read/:partnerId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.params.partnerId;

    await Chat.updateMany(
      { sender: partnerId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

export default router;
