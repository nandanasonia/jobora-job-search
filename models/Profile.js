// models/Profile.js
// Stores the demo user's job-seeker profile and preferences.
// One document per demo user; uses findOneAndUpdate with upsert to maintain a single profile.

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    // Fixed identifier for the single demo user
    demoUserId: {
      type: String,
      default: 'demo-user-001',
      unique: true,
      trim: true
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters.'],
      default: ''
    },
    preferredRoles: {
      type: [String],
      default: []
    },
    preferredLocations: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['', 'Internship', 'Fresher / Entry-level', 'Junior', 'Mid-level', 'Senior'],
        message: 'Invalid experience level.'
      },
      default: ''
    },
    preferredWorkMode: {
      type: String,
      enum: {
        values: ['', 'On-site', 'Hybrid', 'Remote'],
        message: 'Preferred work mode must be On-site, Hybrid, or Remote.'
      },
      default: ''
    },
    preferredEmploymentTypes: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Profile', profileSchema);
