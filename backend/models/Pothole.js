// =============================================
// POTHOLE.JS — The data model
// Defines what a pothole record looks like
// in the database
// =============================================

const mongoose = require('mongoose');

// A 'Schema' defines the structure of our data
// Like designing columns in a spreadsheet
const potholeSchema = new mongoose.Schema(
  {
    // Text description of the pothole
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true, // Removes extra spaces
    },

    // GPS coordinates
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },

    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },

    // Cloudinary image URL
    // Stored as a web link after uploading
    imageUrl: {
      type: String,
      required: [true, 'Image is required'],
    },

    // Cloudinary public ID
    // Needed if we want to delete the image later
    imagePublicId: {
      type: String,
    },

    // Status of the pothole report
    // Can only be one of these 3 values
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'fixed'],
      default: 'pending', // New reports start as 'pending'
    },

    // Optional: address text
    address: {
      type: String,
      default: '',
    },
  },

  // This automatically adds:
  // createdAt — when report was submitted
  // updatedAt — when report was last changed
  { timestamps: true }
);

// Create the model from the schema
// 'Pothole' becomes the collection name in MongoDB (stored as 'potholes')
const Pothole = mongoose.model('Pothole', potholeSchema);

// Export so other files can use it
module.exports = Pothole;