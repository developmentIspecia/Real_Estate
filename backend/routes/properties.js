import express from "express";
import multer from "multer";
import Property from "../models/Property.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import streamifier from "streamifier";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temporary storage

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/add", authMiddleware, upload.array("images", 10), async (req, res) => {
  try {
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: "properties" });
      uploadedImages.push(result.secure_url);
      fs.unlinkSync(file.path); // remove temp file
    }

    const newProperty = await Property.create({
      title: req.body.title,
      category: req.body.category,
      sellType: req.body.sellType,
      price: req.body.price,
      contact: req.body.contact,
      images: uploadedImages,
      agent: req.user.id, // Set the agent from decoded token
    });
    
    // 📢 Real-time update
    if (req.io) {
      req.io.emit("propertyAdded", newProperty);
    }
    
    res.status(201).json(newProperty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get All Properties ----------------
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error("Error fetching properties:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get Properties by Category ----------------
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const properties = await Property.find({ category }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error("Error fetching properties by category:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Get Properties by Agent ----------------
router.get("/agent/:agentId", async (req, res) => {
  try {
    const { agentId } = req.params;
    const properties = await Property.find({ agent: agentId }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error("Error fetching properties by agent:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- Update Property ----------------
const memUpload = multer({ storage: multer.memoryStorage() });

const uploadBufferToCloudinary = (buffer) => {
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

router.put("/:id", memUpload.array("images", 10), async (req, res) => {
  try {
    const { title, description, location, category, price, beds, baths, sqft, amenities, sellType, contact, existingImages } = req.body;

    // Upload new images to Cloudinary
    const newImageUrls = await Promise.all(
      (req.files || []).map((file) => uploadBufferToCloudinary(file.buffer))
    );

    // Parse kept existing images
    let keptImages = [];
    try {
      keptImages = existingImages ? JSON.parse(existingImages) : [];
    } catch (e) {
      keptImages = [];
    }

    // Merge existing + new images
    const allImages = [...keptImages, ...newImageUrls];

    const updateData = { title, description, location, category, price, beds, baths, sqft, amenities, sellType, contact, images: allImages };

    const updatedProperty = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedProperty) return res.status(404).json({ message: "Property not found" });
    
    // 📢 Real-time update
    if (req.io) {
      req.io.emit("propertyUpdated", updatedProperty);
    }
    
    res.json(updatedProperty);
  } catch (err) {
    console.error("Error updating property (ID: " + req.params.id + "):", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------- Delete Property ----------------
router.delete("/:id", async (req, res) => {
  try {
    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) return res.status(404).json({ message: "Property not found" });
    
    // 📢 Real-time update
    if (req.io) {
      req.io.emit("propertyDeleted", req.params.id);
    }
    
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Error deleting property:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
