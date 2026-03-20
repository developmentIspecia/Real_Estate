// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  middleName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  location: String,
  bio: String,
  profilePhoto: String,
  role: { type: String, default: "user" },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
});

export default mongoose.model("User", userSchema); // ✅ default export
