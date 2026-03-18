import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({}).select("name email role password isVerified");
    console.log("Found Users:");
    console.log("Total Users:", users.length);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [${u.role}] - Verified: ${u.isVerified}`);
      // Don't log full password for security, just check if it's bcrypt or plain
      const isBcrypt = u.password.startsWith("$2");
      console.log(`  Password Type: ${isBcrypt ? "bcrypt" : "plain"}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error checking users:", err);
    process.exit(1);
  }
};

checkUsers();
