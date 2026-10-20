// models/Job.js
// Mongoose schema and model for job listings.
// isDemo: true means this is a seeded demo listing, not a real vacancy.

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required.'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters.']
    },
    company: {
      type: String,
      required: [true, 'Company name is required.'],
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters.']
    },
    location: {
      type: String,
      trim: true,
      default: 'Not specified'
    },
    workMode: {
      type: String,
      enum: {
        values: ['On-site', 'Hybrid', 'Remote'],
        message: 'Work mode must be On-site, Hybrid, or Remote.'
      },
      default: 'On-site'
    },
    employmentType: {
      type: String,
      enum: {
        values: ['Full-time', 'Part-time', 'Internship', 'Contract'],
        message: 'Employment type must be Full-time, Part-time, Internship, or Contract.'
      },
      default: 'Full-time'
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ['Internship', 'Fresher / Entry-level', 'Junior', 'Mid-level', 'Senior'],
        message: 'Invalid experience level.'
      },
      default: 'Fresher / Entry-level'
    },
    description: {
      type: String,
      required: [true, 'Job description is required.'],
      trim: true
    },
    responsibilities: {
      type: String,
      trim: true,
      default: ''
    },
    qualifications: {
      type: String,
      trim: true,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    salaryMin: {
      type: Number,
      min: [0, 'Salary cannot be negative.'],
      default: null
    },
    salaryMax: {
      type: Number,
      min: [0, 'Salary cannot be negative.'],
      default: null
    },
    currency: {
      type: String,
      trim: true,
      default: 'INR'
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional field
          try {
            const url = new URL(v);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch {
            return false;
          }
        },
        message: 'Application URL must be a valid http or https URL.'
      }
    },
    applicationDeadline: {
      type: Date,
      default: null
    },
    companyInfo: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      trim: true,
      default: 'Demo'
    },
    isDemo: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    postedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // adds createdAt and updatedAt automatically
  }
);

// Index for common search fields — improves query performance
jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ postedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
