const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: [],
    });
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [],
  });
};

module.exports = errorHandler;
