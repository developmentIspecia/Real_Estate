import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import os from "os";

dotenv.config();

// ---------------- ROUTES ----------------
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import chatRoutes from "./routes/chat.js";
import propertyRoutes from "./routes/properties.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import Chat from "./models/Chat.js";

const app = express();
const server = http.createServer(app);

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 📝 Request Logger (for debugging)
app.use((req, res, next) => {
  if (req.path === "/api/auth/login" || req.path === "/api/auth/signup") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, {
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
    });
  }
  next();
});

// ✅ Serve uploaded files correctly
app.use("/uploads", express.static("uploads"));



// ---------------- SOCKET.IO ----------------
const io = new Server(server, { cors: { origin: "*" } });

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/upload-property", uploadRoutes);


const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });
  });
});

// ---------------- DATABASE & SERVER ----------------
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;

    // 🔍 Auto-detect local IP
    const networkInterfaces = os.networkInterfaces();
    let localIP = "localhost";
    for (const interfaceName of Object.keys(networkInterfaces)) {
      for (const net of networkInterfaces[interfaceName]) {
        if (net.family === "IPv4" && !net.internal) {
          localIP = net.address;
        }
      }
    }

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://${localIP}:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB error:", err.message));
