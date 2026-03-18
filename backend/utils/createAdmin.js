import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      if (existingAdmin.email && existingAdmin.email.trim() !== "") {
        console.log("⚠️ Admin already exists:", existingAdmin.email);
        process.exit(0);
      } else {
        console.log("🗑️ Invalid admin record found (empty email). Deleting...");
        await User.deleteOne({ _id: existingAdmin._id });
      }
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new User({
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    await admin.save();
    console.log("🎉 Admin created successfully:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();