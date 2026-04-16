// =============================================
// SERVER.JS — The main backend file
// This starts your server and connects everything
// =============================================

// 'require' is how we import libraries in Node.js
// Think of it like importing ingredients before cooking

const express = require('express');      // Creates our server
const mongoose = require('mongoose');    // Connects to MongoDB
const cors = require('cors');            // Allows frontend to talk to backend
const dotenv = require('dotenv');        // Reads our .env secret file
const path = require('path');            // Helps with file paths (built into Node)

// Load secret keys from .env file
// Must be called before using any process.env variables
dotenv.config();

// Create the Express app
// Think of 'app' as your server object
const app = express();

// ─────────────────────────────────────────────
// MIDDLEWARE
// Middleware = code that runs on EVERY request
// before it reaches your routes
// Think of it as a security checkpoint
// ─────────────────────────────────────────────

// Allow requests from your frontend
// Without this, browser blocks frontend → backend communication
app.use(cors());

// Allow server to read JSON data from requests
app.use(express.json());

// Allow server to read form data from requests
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// ROUTES
// Routes define what happens when someone
// visits a specific URL on your server
// ─────────────────────────────────────────────

// Import our pothole routes file
const potholeRoutes = require('./routes/potholeRoutes');

// Any URL starting with /api/potholes
// will be handled by potholeRoutes
app.use('/api/potholes', potholeRoutes);

// ─────────────────────────────────────────────
// TEST ROUTE
// Visit http://localhost:5000 to check if
// your server is running
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    message: '🚧 Pothole Reporting API is running!',
    status: 'OK'
  });
});

// ─────────────────────────────────────────────
// CONNECT TO MONGODB + START SERVER
// We only start the server AFTER connecting
// to the database successfully
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    // Database connected! Now start the server
    console.log('✅ MongoDB connected successfully!');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // Something went wrong connecting to database
    console.log('❌ MongoDB connection failed:', error.message);
  });