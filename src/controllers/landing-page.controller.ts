import type { Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { UserRole } from '../interfaces/index.ts';
import { AppError } from '../utils/AppError.ts';
import type { AuthRequest, PatchLandingPageInput } from '../interfaces/index.ts';
import landingPageService from '../services/landing-page.service.ts';
import * as mediaService from '../services/media.service.ts';

// Extend Express Request to include file
declare module 'express-serve-static-core' {
  interface Request {
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
  }
}

export class LandingPageController {
  async getLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      const landingPage = await landingPageService.getLandingPageByTenant(tenantId);

      res.status(200).json({
        success: true,
        message: 'Landing page fetched successfully',
        data: landingPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async createLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      const landingPage = await landingPageService.createLandingPage(tenantId, req.body);

      res.status(201).json({
        success: true,
        message: 'Landing page created successfully',
        data: landingPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      const landingPage = await landingPageService.updateLandingPage(tenantId, req.body);

      res.status(200).json({
        success: true,
        message: 'Landing page updated successfully',
        data: landingPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      await landingPageService.deleteLandingPage(tenantId);

      res.status(200).json({
        success: true,
        message: 'Landing page deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleLandingPageStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;
      const { isActive } = req.body;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      if (typeof isActive !== 'boolean') {
        throw new AppError('isActive must be a boolean value', 400);
      }

      const landingPage = await landingPageService.toggleLandingPageStatus(tenantId, isActive);

      res.status(200).json({
        success: true,
        message: `Landing page ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: landingPage,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadLandingPageImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;
      const { section, testimonialIndex } = req.body;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      if (!section) {
        throw new AppError('Section is required', 400);
      }

      // Validate section
      const validSections = ['logo', 'section1', 'section2', 'section3', 'section4', 'section5'];
      if (!validSections.includes(section)) {
        throw new AppError('Invalid section. Must be one of: ' + validSections.join(', '), 400);
      }

      // Convert testimonialIndex to number if provided (form data sends as string)
      const parsedTestimonialIndex = testimonialIndex ? parseInt(testimonialIndex, 10) : undefined;

      // Upload image using existing media service
      const media = await mediaService.uploadMedia(tenantId, userId, {
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: 'IMAGE',
        isProtected: false,
      });

      // Update landing page with the new image URL
      const landingPage = await landingPageService.updateLandingPageWithImage(
        tenantId,
        section,
        media.s3Key, // Save S3 key instead of signed URL
        parsedTestimonialIndex
      );

      res.status(200).json({
        success: true,
        message: `Image uploaded and ${section} updated successfully`,
        data: {
          url: media.signedUrl,
          mediaId: media.mediaId,
          fileName: media.fileName,
          s3Key: media.s3Key,
          updatedSection: section,
          fullLandingPage: landingPage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Partial update landing page (PATCH)
  async patchLandingPage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const { User } = await import('../models/User.ts');
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      const updateData: PatchLandingPageInput = req.body;

      // Partial update landing page
      const landingPage = await landingPageService.patchLandingPage(tenantId, updateData);

      res.status(200).json({
        success: true,
        message: 'Landing page updated successfully',
        data: landingPage,
      });
    } catch (error) {
      next(error);
    }
  }

  // Public endpoint to get landing page by tenant slug (for frontend display)
  async getPublicLandingPage(
    req: Request<{ tenantSlug?: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { tenantSlug } = req.params;

      if (!tenantSlug) {
        throw new AppError('Tenant slug is required', 400);
      }

      // Find tenant by slug
      const { Tenant } = await import('../models/Tenant.ts');
      const tenant = await Tenant.findOne({ slug: tenantSlug, isActive: true });

      if (!tenant) {
        throw new AppError('Tenant not found', 404);
      }

      // Get landing page
      const tenantId = (tenant._id as Types.ObjectId).toString();
      const landingPage = await landingPageService.getLandingPageByTenant(tenantId);

      if (!landingPage.isActive) {
        throw new AppError('Landing page is not active', 404);
      }

      // Return public-safe data (excluding sensitive fields)
      const publicData = {
        ...(landingPage.toObject ? landingPage.toObject() : landingPage),
        tenant: {
          name: tenant.name,
          logo: tenant.logo,
          website: tenant.website,
        },
      };

      res.status(200).json({
        success: true,
        message: 'Landing page fetched successfully',
        data: publicData,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LandingPageController();
