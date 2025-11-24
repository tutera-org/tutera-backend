import { Router } from 'express';
import type { RequestHandler } from 'express';
import multer from 'multer';
import * as controller from '../controllers/media.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';

const router = Router();

const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE || 2147483648); // default 2GB

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
});

/**
 * NEW: Direct file upload endpoint
 * POST /media/upload (multipart/form-data with file + metadata)
 */
router.post(
  '/upload',
  authenticate as unknown as RequestHandler,
  upload.single('file'),
  controller.uploadMedia
);

// get list of media with pagination
router.get('/', authenticate as unknown as RequestHandler, controller.getAllMedia);

// get single media by ID
router.get('/:id', authenticate as unknown as RequestHandler, controller.getMedia);

// update media (replace file or update metadata)
router.put(
  '/:id',
  authenticate as unknown as RequestHandler,
  upload.single('file'),
  controller.updateMedia
);

// delete media by ID
router.delete('/:id', authenticate as unknown as RequestHandler, controller.deleteMedia);

export default router;
