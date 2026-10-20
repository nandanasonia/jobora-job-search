// routes/applicationRoutes.js
// Express routes for the personal application tracker.
// Allows users to add, update, and delete application tracking records.
// IMPORTANT: This tracks the user's own progress — it does NOT submit anything to any employer.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');

const DEMO_USER = 'demo-user-001';
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const VALID_STATUSES = [
  'Interested', 'Preparing to Apply', 'Applied',
  'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'
];

// ─────────────────────────────────────────────
// GET /api/applications
// Retrieve all tracked applications for the demo user
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const applications = await Application.find({ demoUserId: DEMO_USER })
      .populate('job')
      .sort({ dateAdded: -1 })
      .lean();

    res.status(200).json({
      success: true,
      total: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// GET /api/applications/:id
// Retrieve one tracked application by its ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID format.' });
    }

    const application = await Application.findOne({ _id: id, demoUserId: DEMO_USER })
      .populate('job')
      .lean();

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// POST /api/applications
// Add a job to the application tracker
// Body: { jobId, status, notes, appliedAt }
// ─────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { jobId, status = 'Interested', notes = '', appliedAt } = req.body;

    if (!jobId || !isValidObjectId(jobId)) {
      return res.status(400).json({ success: false, message: 'A valid jobId is required.' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Create the application record
    const appData = {
      job: jobId,
      status,
      notes: notes.toString().trim().slice(0, 2000),
      demoUserId: DEMO_USER,
      dateAdded: new Date()
    };

    if (appliedAt) {
      const parsedDate = new Date(appliedAt);
      if (!isNaN(parsedDate)) appData.appliedAt = parsedDate;
    }

    const application = await Application.create(appData);
    await application.populate('job');

    res.status(201).json({
      success: true,
      message: 'Application added to tracker.',
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// PUT /api/applications/:id
// Update an application's status, notes, or appliedAt date
// Body: { status, notes, appliedAt }
// ─────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID format.' });
    }

    const { status, notes, appliedAt } = req.body;

    // Only allow whitelisted fields to be updated
    const updates = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      updates.status = status;
    }

    if (notes !== undefined) {
      updates.notes = notes.toString().trim().slice(0, 2000);
    }

    if (appliedAt !== undefined) {
      if (appliedAt === null || appliedAt === '') {
        updates.appliedAt = null;
      } else {
        const parsedDate = new Date(appliedAt);
        if (isNaN(parsedDate)) {
          return res.status(400).json({ success: false, message: 'Invalid appliedAt date format.' });
        }
        updates.appliedAt = parsedDate;
      }
    }

    const application = await Application.findOneAndUpdate(
      { _id: id, demoUserId: DEMO_USER },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Application updated.',
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/applications/:id
// Delete a tracked application
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID format.' });
    }

    const deleted = await Application.findOneAndDelete({ _id: id, demoUserId: DEMO_USER });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    res.status(200).json({ success: true, message: 'Application removed from tracker.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
