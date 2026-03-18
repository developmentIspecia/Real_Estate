import cloudinary from "cloudinary";
import Property from "../models/Property.js";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProperty = async (req, res) => {
  try {
    const { title, category, propertyFor, price, contact } = req.body;
    const result = await cloudinary.v2.uploader.upload(req.file.path, { folder: "properties" });

    const newProperty = new Property({
      title,
      category,
      propertyFor,
      price,
      contact,
      imageUrl: result.secure_url,
    });

    await newProperty.save();
    fs.unlinkSync(req.file.path); // remove local file
    res.status(200).json({ message: "Property uploaded successfully!", property: newProperty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error });
  }
};

export const getPropertiesByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const properties = await Property.find({ category });
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching properties", error: err });
  }
};
