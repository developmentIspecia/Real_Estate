import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../utils/mailer.js";
import dotenv from "dotenv";
dotenv.config();

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME,
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ---------------- SIGNUP ---------------- */
export const signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    password = password.trim();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp,
      otpExpiry,
      role: "user",
    });
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({
      message: "Signup successful, OTP sent to email",
      otpRequired: true,
      role: "user",
      email,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- LOGIN ---------------- */
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    password = password.trim();

    // Admin login (requires OTP every time)
    if (
      email.toLowerCase() === ADMIN.email.toLowerCase() &&
      password === ADMIN.password
    ) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      let admin = await User.findOne({ email: email.toLowerCase() });
      if (!admin)
        admin = new User({
          name: ADMIN.name,
          email: ADMIN.email,
          role: "admin",
        });

      admin.otp = otp;
      admin.otpExpiry = otpExpiry;
      await admin.save();

      await sendOTPEmail(email, otp);

      return res.json({
        otpRequired: true,
        role: "admin",
        email,
        message: "Admin credentials valid, OTP sent to email",
      });
    }

    // User login (no OTP after signup)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "user", email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      message: "Login successful",
      otpRequired: false,
      role: "user",
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email & OTP required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.otp)
      return res.status(400).json({ message: "Request OTP first" });

    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: "OTP expired" });

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      message: "OTP verified successfully",
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
