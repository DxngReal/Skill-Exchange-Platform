const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Resource not found' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
