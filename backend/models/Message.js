import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true }, // 1:1 room between user & admin
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // createdAt, updatedAt
);

export default mongoose.model("Message", messageSchema);
