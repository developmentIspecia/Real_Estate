import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// GET /api/user/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Include middleName and lastName
    const user = await User.findById(req.user.id).select(
      "name middleName lastName email role"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("User profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
