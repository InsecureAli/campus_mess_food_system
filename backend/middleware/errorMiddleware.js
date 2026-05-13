// =============================================
// middleware/errorMiddleware.js
// =============================================
// Centralized error handling for the entire API
// Instead of handling errors in every route,
// we send them all here

// ─────────────────────────────────────────────
// notFound - 404 Handler
// ─────────────────────────────────────────────
// When someone requests a route that doesn't exist
// Example: GET /api/something-that-doesnt-exist

export const notFound = (req, res, next) => {
  // Create an error with a descriptive message
  const error = new Error(`Route not found: ${req.originalUrl}`);
  
  // Set HTTP status to 404 (Not Found)
  res.status(404);
  
  // Pass error to the next error handler (errorHandler below)
  next(error);
};

// ─────────────────────────────────────────────
// errorHandler - Global Error Handler
// ─────────────────────────────────────────────
// Handles ALL errors from the entire application
// Express recognizes this as error middleware because
// it has 4 parameters: (err, req, res, next)

export const errorHandler = (err, req, res, next) => {
  // Sometimes the status code is set before throwing error
  // If not, use 500 (Internal Server Error) as default
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // ── Handle Specific MongoDB/Mongoose Errors ──

  // CastError: Invalid MongoDB ObjectId
  // Example: /api/users/invalid-id (not a valid MongoDB ID)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found (invalid ID format)';
  }

  // ValidationError: Mongoose schema validation failed
  // Example: required field missing, invalid email format
  if (err.name === 'ValidationError') {
    statusCode = 400; // 400 = Bad Request
    // Extract all validation error messages
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Duplicate key error (unique field violation)
  // Example: trying to register with an email that already exists
  if (err.code === 11000) {
    statusCode = 400;
    // Extract the field name from the error
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists. Please use a different ${field}`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again';
  }

  // ── Send Error Response ─────────────────────
  res.status(statusCode).json({
    success: false,
    message: message,
    // Only show error stack trace in development
    // Never expose it in production (security risk)
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};