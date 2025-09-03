import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Prisma errors
  if (error.code === 'P2002') {
    res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
      field: error.meta?.target
    });
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      error: 'Record not found',
      message: 'The requested record was not found'
    });
    return;
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      details: error.errors
    });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid'
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired',
      message: 'The provided token has expired'
    });
    return;
  }

  // Multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      error: 'File too large',
      message: 'The uploaded file exceeds the maximum allowed size'
    });
    return;
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    res.status(413).json({
      error: 'Too many files',
      message: 'Too many files uploaded at once'
    });
    return;
  }

  // Default error
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
