// models/SavedJob.js
// Stores jobs the user has bookmarked.
// For this single-user demo, a demoUserId field identifies the demo user.
// This is NOT real authentication — it is clearly a classroom demo approach.

const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required.']
    },
    // demoUserId is a fixed identifier for the single demo user.
    // In a real app with authentication, this would be a real user ObjectId.
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

// Prevent the same demo user from saving the same job twice
savedJobSchema.index({ job: 1, demoUserId: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema);
