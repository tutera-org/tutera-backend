import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest, AdminJwtPayload, UserJwtPayload } from '../interfaces/index.ts';
import { UserRole } from '../interfaces/index.ts';
import { User } from '../models/User.ts';
import { AppError } from '../utils/AppError.ts';
import { JWT_SECRET, JWT_ADMIN_SECRET, JWT_ADMIN_AUDIENCE } from '../config/constants.ts';

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
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;

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
 * ADMIN AUTH MIDDLEWARE
 * ------------------------------------------------------
 * Protect routes using ADMIN JWT tokens
 * (separate secret, audience, and payload structure)
 */
export const authenticateAdmin = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  try {
    const token =
      req.cookies?.admin_token ||
      req.header('x-admin-token') ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Admin authorization token missing', 401);
    }

    const decoded = jwt.verify(token, JWT_ADMIN_SECRET, {
      audience: JWT_ADMIN_AUDIENCE,
    }) as AdminJwtPayload;

    if (decoded.role !== 'super_admin') {
      throw new AppError('Admin privileges required', 403);
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid admin token', 403));
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
