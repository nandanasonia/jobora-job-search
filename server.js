// server.js
// Main entry point for the Jobora Express server.
// Connects to MongoDB, mounts all API routes, serves static frontend files.

require('dotenv').config(); // Load .env variables first

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const jobRoutes = require('./routes/jobRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Import models for dashboard route
const Job = require('./models/Job');
const SavedJob = require('./models/SavedJob');
const Application = require('./models/Application');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors()); // Allow cross-origin requests (useful during development)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

// Serve static frontend files from the public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/jobs', jobRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);

// ─────────────────────────────────────────────
// Dashboard summary route
// GET /api/dashboard
// Returns real counts from the database for the dashboard cards
// ─────────────────────────────────────────────
app.get('/api/dashboard', async (req, res, next) => {
  try {
    const DEMO_USER = 'demo-user-001';

    // Run all counts in parallel for efficiency
    const [
      totalJobs,
      savedCount,
      applications
    ] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      SavedJob.countDocuments({ demoUserId: DEMO_USER }),
      Application.find({ demoUserId: DEMO_USER }).lean()
    ]);

    // Calculate status breakdown from application records
    const statusCounts = {};
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const activeApplications = applications.filter(
      a => !['Rejected', 'Withdrawn'].includes(a.status)
    ).length;

    const interviews = (statusCounts['Interview'] || 0);
    const offers = (statusCounts['Offer'] || 0);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        savedCount,
        totalApplications: applications.length,
        activeApplications,
        interviews,
        offers,
        statusBreakdown: statusCounts
      }
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// Catch-all: serve the frontend SPA for any non-API route
// ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────
// Centralized Error Handler (must be last middleware)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Jobora server running at http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
