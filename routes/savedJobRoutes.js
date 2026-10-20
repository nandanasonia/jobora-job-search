// routes/savedJobRoutes.js
// Express routes for saving and unsaving jobs.
// All operations are for the single demo user (demoUserId: 'demo-user-001').

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SavedJob = require('../models/SavedJob');

const DEMO_USER = 'demo-user-001';
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────
// GET /api/saved-jobs
// Retrieve all saved jobs for the demo user, populated with job details
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ demoUserId: DEMO_USER })
      .populate('job') // fetch full job document
      .sort({ createdAt: -1 })
      .lean();

    // Filter out entries where the job was deleted from the database
    const validSavedJobs = savedJobs.filter(sj => sj.job !== null);

    res.status(200).json({
      success: true,
      total: validSavedJobs.length,
      data: validSavedJobs
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// POST /api/saved-jobs
// Save a job by its jobId
// Body: { jobId: String }
// ─────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId || !isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: 'A valid jobId is required.' });
    }

    // Check if already saved (prevents duplicate)
    const existing = await SavedJob.findOne({ job: jobId, demoUserId: DEMO_USER });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This job is already saved.' });
    }

    const savedJob = await SavedJob.create({ job: jobId, demoUserId: DEMO_USER });
    await savedJob.populate('job');

    res.status(201).json({
      success: true,
      message: 'Job saved successfully.',
      data: savedJob
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/saved-jobs/:jobId
// Unsave a job by the original Job's ObjectId
// ─────────────────────────────────────────────
router.delete('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID format.' });
    }

    const deleted = await SavedJob.findOneAndDelete({ job: jobId, demoUserId: DEMO_USER });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Saved job record not found.' });
    }

    res.status(200).json({ success: true, message: 'Job removed from saved list.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
