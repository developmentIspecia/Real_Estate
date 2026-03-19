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
    const users = await User.find({ role: { $in: ["user", "agent"] } }).select("name email role isBlocked");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- GET SINGLE USER DETAIL ----------------
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user detail:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- BLOCK/UNBLOCK USER ----------------
router.put("/users/:id/block", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    // 📢 Socket update
    if (req.io) {
      req.io.emit("userStatusChanged", { userId: user._id, isBlocked: user.isBlocked });
    }
    
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, isBlocked: user.isBlocked });
  } catch (err) {
    console.error("Error blocking user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- DELETE USER ----------------
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Also delete their properties if they were an agent? 
    // Usually better to just unassign or mark as inactive.
    await Property.deleteMany({ agent: req.params.id });

    // 📢 Socket update
    if (req.io) {
        req.io.emit("userDeleted", req.params.id);
    }
    
    res.json({ message: "User and their properties removed successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
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
