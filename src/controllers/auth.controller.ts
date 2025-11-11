import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import mongoose from 'mongoose';
// import type { AuthRequest } from '../interfaces/index.ts';
// import { AuthRequest } from '../interfaces';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * @swagger
   * /auth/register/institution:
   *   post:
   *     summary: Register institution or independent user
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

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
   * /auth/me:
   *   get:
   *     summary: Get current user profile
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   */

  // getCurrentUser = async (
  // req: AuthRequest,
  // res: Response,
  // next: NextFunction): Promise<void> => {
  //   try {
  //     const result = await this.authService.getCurrentUser(req.user!.userId);
  //     ApiResponse.success(res, result, 'User profile retrieved');
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   */
  logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie('refreshToken');
      ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
