const { validationResult } = require("express-validator");

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Submitted data is invalid.",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

function notFound(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.name || "Error",
    message: err.message || "An unexpected error occurred.",
  });
}

module.exports = { handleValidation, notFound, errorHandler };
