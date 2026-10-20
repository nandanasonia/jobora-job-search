// routes/profileRoutes.js
// Express routes for the demo user's job-seeker profile and preferences.
// Uses upsert so there is always exactly one profile document for the demo user.

const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

const DEMO_USER = 'demo-user-001';

// ─────────────────────────────────────────────
// GET /api/profile
// Retrieve the demo user's profile/preferences
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    // findOne returns null if no profile exists yet — that's okay
    let profile = await Profile.findOne({ demoUserId: DEMO_USER }).lean();

    if (!profile) {
      // Return an empty profile structure instead of 404
      profile = {
        demoUserId: DEMO_USER,
        displayName: '',
        preferredRoles: [],
        preferredLocations: [],
        skills: [],
        experienceLevel: '',
        preferredWorkMode: '',
        preferredEmploymentTypes: []
      };
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// PUT /api/profile
// Create or update the demo user's profile/preferences
// Body: { displayName, preferredRoles, preferredLocations, skills,
//         experienceLevel, preferredWorkMode, preferredEmploymentTypes }
// ─────────────────────────────────────────────
router.put('/', async (req, res, next) => {
  try {
    const {
      displayName,
      preferredRoles,
      preferredLocations,
      skills,
      experienceLevel,
      preferredWorkMode,
      preferredEmploymentTypes
    } = req.body;

    // Build allowed update object — only include fields that were provided
    const updates = {};

    if (displayName !== undefined) {
      updates.displayName = displayName.toString().trim().slice(0, 100);
    }
    if (Array.isArray(preferredRoles)) {
      updates.preferredRoles = preferredRoles.map(r => r.toString().trim()).filter(Boolean).slice(0, 20);
    }
    if (Array.isArray(preferredLocations)) {
      updates.preferredLocations = preferredLocations.map(l => l.toString().trim()).filter(Boolean).slice(0, 20);
    }
    if (Array.isArray(skills)) {
      updates.skills = skills.map(s => s.toString().trim()).filter(Boolean).slice(0, 50);
    }

    const validLevels = ['', 'Internship', 'Fresher / Entry-level', 'Junior', 'Mid-level', 'Senior'];
    if (experienceLevel !== undefined && validLevels.includes(experienceLevel)) {
      updates.experienceLevel = experienceLevel;
    }

    const validModes = ['', 'On-site', 'Hybrid', 'Remote'];
    if (preferredWorkMode !== undefined && validModes.includes(preferredWorkMode)) {
      updates.preferredWorkMode = preferredWorkMode;
    }

    const validTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
    if (Array.isArray(preferredEmploymentTypes)) {
      updates.preferredEmploymentTypes = preferredEmploymentTypes.filter(t => validTypes.includes(t));
    }

    // Upsert: create if doesn't exist, update if it does
    const profile = await Profile.findOneAndUpdate(
      { demoUserId: DEMO_USER },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
