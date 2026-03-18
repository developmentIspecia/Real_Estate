import { CloudinaryStorage } from 'multer-storage-cloudinary';
import pkg from 'multer-storage-cloudinary';
console.log("Named export:", typeof CloudinaryStorage);
console.log("Default export:", typeof pkg);
console.log("Default properties:", Object.keys(pkg || {}));
