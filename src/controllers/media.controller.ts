import type { Request, Response, NextFunction } from 'express';
import * as mediaService from '../services/media.service.ts';
import type { MediaType } from '../models/Media.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';

// Extend Express Request to include 'context'
declare module 'express-serve-static-core' {
  interface Request {
    context: {
      tenantId: string;
    };
    user?: {
      _id: string;
      tenantId: string;
      userId: string;
    };
    file?: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    };
  }
}

/**
 * Upload a media file (direct upload, not presigned)
 * Frontend sends multipart/form-data with file + metadata
 */
const MEDIA_TYPES: MediaType[] = ['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'];

function parseMediaType(value: unknown): MediaType | undefined {
  if (typeof value !== 'string') return undefined;
  const upper = value.toUpperCase() as MediaType;
  return MEDIA_TYPES.includes(upper) ? upper : undefined;
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Extract tenantId from JWT payload
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in token' });
    }

    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const { type, isProtected } = req.body;
    let overrideType: MediaType | undefined;
    if (typeof type !== 'undefined') {
      overrideType = parseMediaType(type);
      if (!overrideType) {
        return res
          .status(400)
          .json({ message: 'Valid type (VIDEO, IMAGE, DOCUMENT, AUDIO) required' });
      }
    }

    const uploadInput: {
      fileBuffer: Buffer;
      fileName: string;
      mimeType: string;
      size: number;
      type?: MediaType;
      isProtected?: boolean;
    } = {
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      isProtected: isProtected === 'true' ? true : isProtected === 'false' ? false : true,
    };

    if (overrideType) {
      uploadInput.type = overrideType;
    }

    const result = await mediaService.uploadMedia(tenantId, userId, uploadInput);

    res.status(201).json({ message: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get media by ID (includes signedUrl for download)
 */
export async function getMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in token' });
    }

    const mediaId = req.params.id;
    if (!mediaId) {
      return res.status(400).json({ message: 'Media ID is required' });
    }
    const payload = await mediaService.getForConsumption(tenantId, mediaId);
    ApiResponse.success(res, payload, 'Media retrieved successfully');
  } catch (err) {
    next(err);
  }
}

// get all media for a tenant
export async function getAllMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in token' });
    }

    const { page, limit } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const { items, pagination } = await mediaService.getAllMedia(tenantId, {
      page: pageNum,
      limit: limitNum,
    });
    ApiResponse.paginated(
      res,
      items,
      pagination.page,
      pagination.limit,
      pagination.total,
      'Media retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
}

// update media (replace file or update metadata)
export async function updateMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in token' });
    }

    const mediaId = req.params.id;
    if (!mediaId) {
      return res.status(400).json({ message: 'Media ID is required' });
    }

    const { type, isProtected } = req.body;
    const updateOptions: {
      file?: { buffer: Buffer; fileName: string; mimeType: string; size: number };
      type?: MediaType;
      isProtected?: boolean;
    } = {};

    if (req.file) {
      updateOptions.file = {
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    if (typeof type !== 'undefined') {
      const parsedType = parseMediaType(type);
      if (!parsedType) {
        return res
          .status(400)
          .json({ message: 'Valid type (VIDEO, IMAGE, DOCUMENT, AUDIO) required' });
      }
      updateOptions.type = parsedType;
    }

    if (typeof isProtected === 'string') {
      updateOptions.isProtected = isProtected === 'true';
    } else if (typeof isProtected === 'boolean') {
      updateOptions.isProtected = isProtected;
    }

    const payload = await mediaService.updateMedia(tenantId, mediaId, updateOptions);

    ApiResponse.success(res, payload, 'Media updated successfully');
  } catch (error) {
    next(error);
  }
}

// delete media
export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found in token' });
    }

    const mediaId = req.params.id;
    if (!mediaId) {
      return res.status(400).json({ message: 'Media ID is required' });
    }

    await mediaService.deleteMedia(tenantId, mediaId);
    ApiResponse.success(res, null, 'Media deleted successfully');
  } catch (error) {
    next(error);
  }
}
