import express from "express";
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import Property from "../models/Property.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ---------------- VERIFY ADMIN ----------------
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    req.admin = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Apply auth + admin verification middleware
router.use(authMiddleware, verifyAdmin);

// ---------------- MULTER CONFIG ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ---------------- ADMIN INFO ----------------
router.get("/info", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProperties = await Property.countDocuments();
    res.json({
      name: req.admin.name || "Admin",   // admin name
      email: req.admin.email,
      users: totalUsers,
      properties: totalProperties,
    });
  } catch (err) {
    console.error("Error fetching admin info:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- GET ALL USERS ----------------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["user", "agent"] } }).select("name email role");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- ADD PROPERTY ----------------
router.post("/properties", upload.single("image"), async (req, res) => {
  try {
    const { title, price, location, type, details, for: propertyFor } = req.body;
    const property = new Property({
      title,
      price,
      location,
      type,
      details,
      for: propertyFor, // "buy" or "rent"
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await property.save();
    res.status(201).json({ message: "Property created", property });
  } catch (err) {
    console.error("Error adding property:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- GET ALL PROPERTIES ----------------
router.get("/properties", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error("Error fetching properties:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
