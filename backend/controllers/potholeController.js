// =============================================
// POTHOLECONTROLLER.JS
// Contains logic for each API endpoint
// =============================================

const Pothole = require('../models/Pothole');

// ─────────────────────────────────────────────
// CREATE — POST /api/potholes
// Called when user submits a new report
// ─────────────────────────────────────────────
const createPothole = async (req, res) => {
  try {
    // req.body contains text fields (description, lat, lng)
    // req.file contains the uploaded image (handled by Cloudinary)
    const { description, latitude, longitude, address } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Please upload an image' 
      });
    }

    // Create a new pothole record in MongoDB
    const pothole = await Pothole.create({
      description,
      latitude: parseFloat(latitude),   // Convert string to number
      longitude: parseFloat(longitude), // Convert string to number
      imageUrl: req.file.path,          // Cloudinary URL
      imagePublicId: req.file.filename, // Cloudinary public ID
      address: address || '',
    });

    // Send success response back to frontend
    res.status(201).json({
      message: '✅ Pothole reported successfully!',
      data: pothole,
    });

  } catch (error) {
    // Something went wrong — send error response
    res.status(500).json({ 
      message: '❌ Server error', 
      error: error.message 
    });
  }
};

// ─────────────────────────────────────────────
// GET ALL — GET /api/potholes
// Called when map page loads all potholes
// ─────────────────────────────────────────────
const getAllPotholes = async (req, res) => {
  try {
    // Fetch ALL potholes from database
    // Sort by newest first (-1 = descending)
    const potholes = await Pothole.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: '✅ Potholes fetched successfully',
      count: potholes.length, // How many total
      data: potholes,
    });

  } catch (error) {
    res.status(500).json({ 
      message: '❌ Server error', 
      error: error.message 
    });
  }
};

// ─────────────────────────────────────────────
// UPDATE STATUS — PATCH /api/potholes/:id
// Called when admin marks a pothole as fixed
// ─────────────────────────────────────────────
const updatePotholeStatus = async (req, res) => {
  try {
    // ':id' comes from the URL
    // e.g. /api/potholes/abc123 → id = 'abc123'
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['pending', 'in-progress', 'fixed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value' 
      });
    }

    // Find the pothole by ID and update its status
    // { new: true } returns the UPDATED record
    const pothole = await Pothole.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!pothole) {
      return res.status(404).json({ 
        message: 'Pothole not found' 
      });
    }

    res.status(200).json({
      message: '✅ Status updated successfully',
      data: pothole,
    });

  } catch (error) {
    res.status(500).json({ 
      message: '❌ Server error', 
      error: error.message 
    });
  }
};

// ─────────────────────────────────────────────
// DELETE — DELETE /api/potholes/:id
// Called when admin deletes a report
// ─────────────────────────────────────────────
const deletePothole = async (req, res) => {
  try {
    const { id } = req.params;

    const pothole = await Pothole.findByIdAndDelete(id);

    if (!pothole) {
      return res.status(404).json({ 
        message: 'Pothole not found' 
      });
    }

    res.status(200).json({ 
      message: '✅ Report deleted successfully' 
    });

  } catch (error) {
    res.status(500).json({ 
      message: '❌ Server error', 
      error: error.message 
    });
  }
};

// Export all functions so routes can use them
module.exports = {
  createPothole,
  getAllPotholes,
  updatePotholeStatus,
  deletePothole,
};