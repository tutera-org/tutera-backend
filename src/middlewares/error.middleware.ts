import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.ts';
import { logger } from '../config/logger.ts';

/**
 * Error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    void logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
    res.status(500).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
    next();
    return;
  }

  // Known AppError — log and respond
  logger.error(`AppError: ${err.message}`, {
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    errors: err.errors,
  });
  res.status(err.statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
  next();
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ success: false, message: 'Not found. Invalid Url path' });
  next();
};
