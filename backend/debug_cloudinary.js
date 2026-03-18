import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Testing Cloudinary connection with:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

// Create a small dummy file to upload
const testFile = "/tmp/test_image.png";
fs.writeFileSync(testFile, "dummy content");

cloudinary.uploader.upload(testFile, { folder: "test" }, (error, result) => {
  if (error) {
    console.error("Cloudinary test upload FAILED:", error);
  } else {
    console.log("Cloudinary test upload SUCCESS:", result.secure_url);
  }
});
