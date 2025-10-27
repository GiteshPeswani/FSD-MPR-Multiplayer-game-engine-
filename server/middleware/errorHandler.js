// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  const payload = {
    error: message,
    name: err.name || 'Error'
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  // Log full error on the server
  console.error(err);

  res.status(status).json(payload);
};
