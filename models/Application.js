// models/Application.js
// Tracks job applications in the user's personal application tracker.
// This tracks the user's own tracking progress — it does NOT submit anything to the employer.

const mongoose = require('mongoose');

const VALID_STATUSES = [
  'Interested',
  'Preparing to Apply',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn'
];

const applicationSchema = new mongoose.Schema(
  {
    // Reference to the Job document (required for jobs in our DB)
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required.']
    },
    // Current tracking status
    status: {
      type: String,
      enum: {
        values: VALID_STATUSES,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      },
      default: 'Interested'
    },
    // Optional personal notes
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters.'],
      default: ''
    },
    // When the user started tracking this application
    dateAdded: {
      type: Date,
      default: Date.now
    },
    // Optional: when the user actually applied (set manually by user)
    appliedAt: {
      type: Date,
      default: null
    },
    // Demo user identifier (same approach as SavedJob)
    demoUserId: {
      type: String,
      default: 'demo-user-001',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Export the list of valid statuses so routes can use it for validation
applicationSchema.statics.VALID_STATUSES = VALID_STATUSES;

module.exports = mongoose.model('Application', applicationSchema);
