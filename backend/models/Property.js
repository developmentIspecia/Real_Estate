// models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    category: { type: String, required: true }, // house, flat, land, commercial, others
    sellType: { type: String, required: true }, // buy / rent
    price: { type: String, required: true },
    beds: { type: String, default: "0" },
    baths: { type: String, default: "0" },
    sqft: { type: String, default: "0" },
    amenities: { type: String },
    contact: { type: String, required: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
