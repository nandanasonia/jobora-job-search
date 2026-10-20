// routes/jobRoutes.js
// Express routes for job listings.
// Supports search, filtering, sorting via query parameters.

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Job = require('../models/Job');

// Helper: validate MongoDB ObjectId string
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Allowlisted sort options to prevent injection
const ALLOWED_SORT = {
  newest: { postedAt: -1 },
  oldest: { postedAt: 1 },
  title_asc: { title: 1 },
  title_desc: { title: -1 },
  salary_asc: { salaryMin: 1 },
  salary_desc: { salaryMax: -1 }
};

// ─────────────────────────────────────────────
// GET /api/jobs
// Query params: search, location, company, type, workMode,
//               experienceLevel, skill, sort, page, limit
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const {
      search = '',
      location = '',
      company = '',
      type = '',
      workMode = '',
      experienceLevel = '',
      skill = '',
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    // Build MongoDB query object
    const query = { isActive: true };

    // Text search: match title, company, description, or skills
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { company: regex },
        { description: regex },
        { skills: regex }
      ];
    }

    // Filter by location (case-insensitive partial match)
    if (location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by company name
    if (company.trim()) {
      query.company = new RegExp(company.trim(), 'i');
    }

    // Filter by employment type (exact enum value)
    const allowedTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
    if (type && allowedTypes.includes(type)) {
      query.employmentType = type;
    }

    // Filter by work mode (exact enum value)
    const allowedModes = ['On-site', 'Hybrid', 'Remote'];
    if (workMode && allowedModes.includes(workMode)) {
      query.workMode = workMode;
    }

    // Filter by experience level (exact enum value)
    const allowedLevels = ['Internship', 'Fresher / Entry-level', 'Junior', 'Mid-level', 'Senior'];
    if (experienceLevel && allowedLevels.includes(experienceLevel)) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by skill (case-insensitive partial match in the skills array)
    if (skill.trim()) {
      query.skills = new RegExp(skill.trim(), 'i');
    }

    // Determine sort order from allowlist
    const sortOrder = ALLOWED_SORT[sort] || ALLOWED_SORT.newest;

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Run query and count in parallel for efficiency
    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sortOrder).skip(skip).limit(limitNum).lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────
// GET /api/jobs/:id
// Retrieve a single job by its MongoDB ObjectId
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID format.' });
    }

    const job = await Job.findById(id).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
