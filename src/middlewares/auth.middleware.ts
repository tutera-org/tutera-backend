import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest, JwtPayload } from '../interfaces/index.ts';
import { UserRole } from '../interfaces/index.ts';
import { User } from '../models/User.ts';
import { AppError } from '../utils/AppError.ts';
import { JWT_SECRET } from '../config/constants.ts';

/**
 * Protect routes - Verify JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in headers
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    // Check for token in cookies
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 403));
    } else {
      next(error);
    }
  }
};

/**
 * Authorize roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
};

/**
 * Check tenant ownership
 */
export const checkTenantOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    // Allow super admin to access any tenant
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }
    const tenantId = req.params.tenantId || req.body.tenantId || req.user.tenantId;

    if (!tenantId) {
      throw new AppError('Tenant Id is required', 400);
    }

    // Check if user belongs to the tenant
    if (req.user.tenantId !== tenantId) {
      throw new AppError('Not authorized to access this domain', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
