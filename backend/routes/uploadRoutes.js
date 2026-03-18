import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Property from "../models/Property.js";
import streamifier from "streamifier";

dotenv.config();
const router = express.Router();

// ---------------- Cloudinary Setup ----------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage so we can stream files to Cloudinary manually
const upload = multer({ storage: multer.memoryStorage() });

// Helper: upload buffer to Cloudinary and return secure_url
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "realestate-properties" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// ---------------- Upload Property Route ----------------
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      category,
      price,
      beds,
      baths,
      sqft,
      amenities,
      sellType,
      contact,
    } = req.body;

    // Upload each image buffer to Cloudinary and collect secure URLs
    const imageUploadPromises = (req.files || []).map((file) =>
      uploadToCloudinary(file.buffer)
    );
    const images = await Promise.all(imageUploadPromises);

    const property = await Property.create({
      title,
      description,
      location,
      category,
      price,
      beds,
      baths,
      sqft,
      amenities,
      sellType,
      contact,
      images,
    });
    
    // 📢 Real-time update: Emit socket event
    if (req.io) {
      req.io.emit("propertyAdded", property);
    }
    
    res.status(201).json(property);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- General Image Upload Route ----------------
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error("General image upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
