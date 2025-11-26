import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware.ts';
import landingPageController from '../controllers/landing-page.controller.ts';
import { RequestValidator } from '../middlewares/validators.middleware.ts';
import {
  createLandingPageSchema,
  updateLandingPageSchema,
} from '../validations/landing-page.validator.ts';
import type { AuthRequest } from '../interfaces/index.ts';

const router = Router();

const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE || 10485760); // 10MB for images

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Protected routes (require authentication and creator/institution role)
router.use(authenticate as RequestHandler);

// Wrapper functions to handle type compatibility
const getLandingPageHandler: RequestHandler = (req, res, next) => {
  landingPageController.getLandingPage(req as AuthRequest, res, next);
};

const uploadLandingPageImageHandler: RequestHandler = (req, res, next) => {
  landingPageController.uploadLandingPageImage(req as AuthRequest, res, next);
};

const createLandingPageHandler: RequestHandler = (req, res, next) => {
  landingPageController.createLandingPage(req as AuthRequest, res, next);
};

const updateLandingPageHandler: RequestHandler = (req, res, next) => {
  landingPageController.updateLandingPage(req as AuthRequest, res, next);
};

const deleteLandingPageHandler: RequestHandler = (req, res, next) => {
  landingPageController.deleteLandingPage(req as AuthRequest, res, next);
};

const toggleLandingPageStatusHandler: RequestHandler = (req, res, next) => {
  landingPageController.toggleLandingPageStatus(req as AuthRequest, res, next);
};

// Get current tenant's landing page
router.get('/', getLandingPageHandler);

// Upload images for landing page sections
router.post('/upload-image', upload.single('image'), uploadLandingPageImageHandler);

// Create landing page (only if none exists)
router.post('/', RequestValidator(createLandingPageSchema), createLandingPageHandler);

// Update landing page
router.put('/', RequestValidator(updateLandingPageSchema), updateLandingPageHandler);

// Delete landing page
router.delete('/', deleteLandingPageHandler);

// Toggle landing page active status
router.patch('/status', toggleLandingPageStatusHandler);

export default router;
