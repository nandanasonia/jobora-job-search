// middleware/errorHandler.js
// Centralized error handling middleware for Express.
// Catches errors passed via next(err) and returns a consistent JSON response.

const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format.' });
  }

  // Duplicate key error (e.g., duplicate saved job)
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate record. This item already exists.' });
  }

  // Generic server error — do NOT expose stack trace to client
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred. Please try again.'
  });
};

module.exports = errorHandler;
