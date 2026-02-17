function errorHandler(err, req, res, _next) {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal server error',
    },
  });
}

module.exports = errorHandler;
