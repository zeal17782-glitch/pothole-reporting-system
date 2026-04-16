// =============================================
// POTHOLEROUTES.JS — Defines API endpoints
// =============================================

const express = require('express');

// Router is like a mini Express app just for routes
const router = express.Router();

// Import controller functions
const {
  createPothole,
  getAllPotholes,
  updatePotholeStatus,
  deletePothole,
} = require('../controllers/potholeController');

// Import upload middleware
const upload = require('../middleware/upload');

// ─────────────────────────────────────────────
// ROUTES TABLE:
//
// METHOD   URL                      ACTION
// POST     /api/potholes            Create new report
// GET      /api/potholes            Get all reports
// PATCH    /api/potholes/:id        Update status
// DELETE   /api/potholes/:id        Delete report
// ─────────────────────────────────────────────

// POST — Create new pothole report
// upload.single('photo') runs BEFORE createPothole
// It intercepts the image and uploads it to Cloudinary first
router.post('/', upload.single('photo'), createPothole);

// GET — Get all potholes
router.get('/', getAllPotholes);

// PATCH — Update pothole status
router.patch('/:id', updatePotholeStatus);

// DELETE — Delete a pothole report
router.delete('/:id', deletePothole);

module.exports = router;