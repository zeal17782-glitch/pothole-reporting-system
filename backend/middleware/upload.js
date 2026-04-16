// =============================================
// UPLOAD.JS — Handles image uploads
// Combines Multer + Cloudinary
// =============================================

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your account details
// These values come from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure where and how to store uploaded images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // Folder name in your Cloudinary account
    folder: 'pothole-reports',

    // Only allow these image formats
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],

    // Automatically resize large images to max 1000px wide
    // Saves storage space without losing quality
    transformation: [{ width: 1000, crop: 'limit' }],
  },
});

// Create the multer upload handler
// 'single' means we accept ONE file per request
// 'photo' must match the field name in our form
const upload = multer({ storage: storage });

module.exports = upload;