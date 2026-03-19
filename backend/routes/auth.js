import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/mailer.js";

const router = express.Router();
const otpStore = new Map();

// ✅ Generate OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Generate JWT token
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

// ------------------ SIGNUP ------------------
router.post("/signup", async (req, res) => {
  try {
    let { name, middleName, lastName, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password required" });


    email = email.toLowerCase().trim();
    password = password.trim();

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      type: "signup",
      tempUser: {
        name,
        middleName: middleName || "",
        lastName: lastName || "",
        email,
        password: hashedPassword,
        role: "user",
      },
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email. Please verify.",
      otpRequired: true,
      email,
    });


  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    email = email.toLowerCase().trim();
    password = password.trim();

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH] Login failed: User not found for email: '${email}'`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ⚠️ Robust password matching (handles both bcrypt and plain-text for all roles)
    const isBcrypt = user.password && user.password.startsWith("$2");
    const isMatch = isBcrypt 
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!isMatch) {
      console.log(`[AUTH] Login failed: Password mismatch for email: '${email}'. Hashed: ${isBcrypt}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔸 Admin login → OTP always required for 2FA
    if (user.role === "admin") {
      const otp = generateOTP();
      otpStore.set(email, {
        otp,
        expires: Date.now() + 10 * 60 * 1000,
        role: "admin",
        type: "login",
      });
      await sendOTPEmail(email, otp);
      return res.json({
        message: "OTP sent to admin email",
        otpRequired: true,
        email,
        role: "admin",
      });
    }

    // 🔹 Regular user with correct credentials → direct login (no OTP)
    // Mark user as verified if not already
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });
    return res.json({
      message: "Login successful",
      otpRequired: false,
      token,
      role: user.role,
      name: user.name,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ------------------ VERIFY OTP ------------------
router.post("/verify-otp", async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });


    email = email.toLowerCase().trim();
    otp = otp.trim();

    const record = otpStore.get(email);
    if (!record)
      return res.status(400).json({ message: "No OTP found, request again" });
    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email);

    // ✅ Signup verification
    if (record.type === "signup" && record.tempUser) {
      const tempUser = record.tempUser;
      const newUser = new User({
        ...tempUser,
        isVerified: true,
      });
      await newUser.save();

      const token = generateToken({
        id: newUser._id,
        role: newUser.role,
        email: newUser.email,
      });
      return res.json({
        message: "Signup verified successfully",
        token,
        role: newUser.role,
        name: newUser.name,
      });
    }

    // ✅ Existing user login
    const existingUser = await User.findOne({ email });
    if (!existingUser)
      return res.status(400).json({ message: "User not found" });

    if (!existingUser.isVerified) {
      existingUser.isVerified = true;
      await existingUser.save();
    }

    const token = generateToken({
      id: existingUser._id,
      role: existingUser.role,
      email: existingUser.email,
    });
    res.json({
      message: "OTP verified successfully",
      token,
      role: existingUser.role,
      name: existingUser.name,
    });

  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ FORGOT PASSWORD ------------------
router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOTP();
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      type: "forgotPassword",
    });

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent to your email", email });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ RESET PASSWORD ------------------
router.post("/reset-password", async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    email = email.toLowerCase().trim();
    const record = otpStore.get(email);

    if (!record || record.type !== "forgotPassword")
      return res.status(400).json({ message: "No OTP found, request again" });

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(email);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ RESEND OTP ------------------
router.post("/resend-otp", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email required" });


    email = email.toLowerCase().trim();

    const record = otpStore.get(email);
    if (!record)
      return res
        .status(400)
        .json({ message: "Session expired. Please sign up/login again." });

    const otp = generateOTP();
    otpStore.set(email, {
      ...record,
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    await sendOTPEmail(email, otp);
    res.json({ message: "New OTP sent to your email" });


  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
