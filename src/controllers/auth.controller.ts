import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.ts';
import { createOtp } from '../utils/otpCode.ts';
import { UserRole, type AuthRequest } from '../interfaces/index.ts';
import { getSocketManager } from '../sockets/index.ts';
import { User } from '../models/User.ts';
// import type { AuthRequest } from '../interfaces/index.ts';
// import { AuthRequest } from '../interfaces';

export class AuthController {
  private readonly authService = new AuthService();

  /**
   * @swagger
   * /auth/register/institution:
   *   post:
   *     summary: Register institution or independent creator
   *     tags: [Authentication]
   */
  registerInstitution = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    try {
      const result = await session.withTransaction(async () => {
        return await this.authService.registerInstitutionOrIndependent(req.body, session);
      });
      ApiResponse.success(res, result, 'Registration successful', 201);
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      next(error);
    } finally {
      session.endSession();
    }
  };

  /**
   * @swagger
   * /auth/register/learner:
   *   post:
   *     summary: Register learner (student)
   *     tags: [Authentication]
   */
  registerLearner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.registerLearner(req.body);
      ApiResponse.success(res, result, 'Learner registration successful', 201);
      const ownerId = await User.findOne({
        role: { $in: [UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION] },
        tenantId: result.tenant.id,
      }).select('id');
      setTimeout(async () => {
        getSocketManager().sendNotification('info', ownerId?.id, {
          userId: result.user.id as string,
          message: `new student ${result.user.firstName} ${result.user.lastName} just onboarded`,
          type: 'onboarding',
        });
      }, 3000);
    } catch (error) {
      next(error);
    }
  };

  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const result = await this.authService.getCurrentUser(userId!);
      ApiResponse.success(res, result, 'User details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/users/update:
   *   patch:
   *     summary: Update user details
   *     tags: [Authentication]
   */
  updateUserDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.authService.updateUserDetails(req.body);
      ApiResponse.success(res, result, 'User details updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: User login
   *     tags: [Authentication]
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const result = await this.authService.login(email, password, ipAddress, userAgent);

      // Securely store refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 1000, // 60 minutes
      });

      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     summary: Refresh access token
   *     tags: [Authentication]
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const result = await this.authService.refreshToken(refreshToken);
      ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /auth/change-password:
   *   patch:
   *     summary: Change user password
   *     tags: [Authentication]
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    const { userId, currentPassword, otpCode, newPassword } = req.body;
    if (!userId || !currentPassword || !otpCode || !newPassword) {
      throw new AppError('Missing required fields', 400);
    }

    const result = await this.authService.changePassword(
      userId,
      currentPassword,
      otpCode,
      newPassword
    );

    ApiResponse.success(res, result, 'Password changed successfully');
  };

  /**
   * @swagger
   * /auth/request-password-reset:
   *   post:
   *     summary: Request password reset OTP
   *     tags: [Authentication]
   */
  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const result = await this.authService.requestPasswordReset(email);
    ApiResponse.success(res, result, 'Password reset request processed');
  };

  /**
   * @swagger
   * /auth/reset-password
   *   patch:
   *     summary: Verify OTP and update password
   *     tags: [Authentication]
   */

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otpCode, newPassword } = req.body;
    const result = await this.authService.resetPassword(email, otpCode, newPassword);
    ApiResponse.success(res, result, 'Password reset successful');
  };

  /**
   * @swagger
   * /auth/refresh-otp
   *   post:
   *     summary: Request OTP for change password
   *     tags: [Authentication]
   */
  refreshOtp = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body;
    const code = await createOtp(userId);
    ApiResponse.success(res, code, 'OTP sent successfully');
  };

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   */
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
        path: '/',
      });
      ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };
}
export default new AuthController();
