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
  isVerified: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema); // ✅ default export
