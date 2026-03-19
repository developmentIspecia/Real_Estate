import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profile-photos" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name middleName lastName email role phone location bio profilePhoto");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("User profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authMiddleware, upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, phone, location, bio, email } = req.body;
    let profilePhoto = req.body.profilePhoto;

    if (req.file) {
      try {
        profilePhoto = await uploadToCloudinary(req.file.buffer);
      } catch (uploadError) {
        console.error("Cloudinary upload error in profile update:", uploadError);
        return res.status(500).json({ message: "Failed to upload profile photo" });
      }
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    if (email) updateData.email = email;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("name middleName lastName email role phone location bio profilePhoto");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Added POST version for better compatibility with multipart/form-data in React Native
router.post("/profile-update", authMiddleware, upload.any(), async (req, res) => {
  try {
    const { name, phone, location, bio, email } = req.body;
    let profilePhoto = req.body.profilePhoto;

    // Find the profilePhoto file if it exists in any of the uploaded files
    const photoFile = req.files?.find(f => f.fieldname === "profilePhoto");

    if (photoFile) {
      try {
        console.log("Found profile photo file:", photoFile.originalname, "size:", photoFile.size);
        profilePhoto = await uploadToCloudinary(photoFile.buffer);
        console.log("Successfully uploaded to Cloudinary:", profilePhoto);
      } catch (uploadError) {
        console.error("Cloudinary upload error in profile POST update:", uploadError);
        return res.status(500).json({ message: "Failed to upload profile photo", error: uploadError.message });
      }
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    if (email) updateData.email = email;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("name middleName lastName email role phone location bio profilePhoto");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile (POST) error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both currentPassword and newPassword are required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password (supports both plain-text legacy and bcrypt-hashed)
    const isMatch = user.password.startsWith("$2")
      ? await bcrypt.compare(currentPassword, user.password)
      : currentPassword === user.password;

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all admins and agents (contacts a user can chat with)
router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    const contacts = await User.find({ role: { $in: ["admin", "agent"] } }).select("_id name email role");
    res.json(contacts);
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

