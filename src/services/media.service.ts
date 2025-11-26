import { MediaModel, type MediaType } from '../models/Media.ts';
import { getSignedGetUrl, s3 } from '../utils/s3Client.ts';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { enqueueProcessingJob } from '../workers/queue.ts';
import { v4 as uuidv4 } from 'uuid';

const BUCKET = process.env.S3_BUCKET!;
const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE || 2147483648);

const MEDIA_TYPES: MediaType[] = ['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'];

function validateUpload(size: number) {
  if (size > MAX_UPLOAD_SIZE) throw new Error('File too large');
}

function detectMediaType(opts: {
  providedType?: MediaType | undefined;
  mimeType?: string | undefined;
  fileName?: string | undefined;
}): MediaType {
  if (opts.providedType && MEDIA_TYPES.includes(opts.providedType)) {
    return opts.providedType;
  }

  const mimeRoot = opts.mimeType?.split('/')[0];
  if (mimeRoot === 'video') return 'VIDEO';
  if (mimeRoot === 'image') return 'IMAGE';
  if (mimeRoot === 'audio') return 'AUDIO';

  if (opts.fileName) {
    const ext = opts.fileName.split('.').pop()?.toLowerCase();
    if (ext) {
      if (['mp4', 'mov', 'mkv', 'webm', 'avi'].includes(ext)) return 'VIDEO';
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'IMAGE';
      if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(ext)) return 'AUDIO';
    }
  }

  return 'DOCUMENT';
}

/**
 * NEW: Upload media directly (backend handles S3 upload)
 * Returns mediaId + signedUrl immediately, enqueues processing
 */
export async function uploadMedia(
  tenantId: string,
  userId: string,
  opts: {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
    size: number;
    type?: MediaType;
    isProtected?: boolean;
  }
) {
  validateUpload(opts.size);
  const resolvedType = detectMediaType({
    providedType: opts.type,
    mimeType: opts.mimeType,
    fileName: opts.fileName,
  });

  const key = `tenants/${tenantId}/media/${Date.now()}-${uuidv4()}-${opts.fileName}`;

  // Upload to S3 directly
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: opts.fileBuffer,
        ContentType: opts.mimeType,
        ContentLength: opts.fileBuffer.length,
      })
    );
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw new Error(
      `Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  // Create media record
  const media = await MediaModel.create({
    tenantId,
    uploadedBy: userId,
    fileName: opts.fileName,
    originalName: opts.fileName,
    mimeType: opts.mimeType,
    size: opts.size,
    s3Key: key,
    type: resolvedType,
    isProtected: opts.isProtected ?? true,
    status: 'UPLOADED', // already in S3, move to next phase
  });

  // Enqueue processing job immediately
  await enqueueProcessingJob({
    mediaId: (media as { _id: { toString(): string } })._id.toString(),
    tenantId: tenantId.toString(),
  });

  // Return signed URL so frontend can access it
  const signedUrl = await getSignedGetUrl(BUCKET, key, 300);

  return {
    mediaId: media._id,
    signedUrl,
    s3Key: key,
    status: media.status,
    fileName: media.fileName,
    type: media.type,
  };
}

// Get media with signed URL if protected
export async function getForConsumption(tenantId: string, mediaId: string) {
  const media = await MediaModel.findOne({ _id: mediaId, tenantId });
  if (!media) throw new Error('Not found');
  if (media.isProtected) {
    const signedUrl = await getSignedGetUrl(BUCKET, media.s3Key, 3600);
    return { ...media.toObject(), signedUrl };
  }
  // else, non-protected: return a direct public link pattern (depends on Wasabi config)
  const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${media.s3Key}`;
  return { ...media.toObject(), url: publicUrl };
}

export async function getAllMedia(tenantId: string, options: { page?: number; limit?: number }) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    MediaModel.find({ tenantId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MediaModel.countDocuments({ tenantId }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
    },
  };
}

// Update media metadata or replace file
export async function updateMedia(
  tenantId: string,
  mediaId: string,
  opts: {
    file?: { buffer: Buffer; fileName: string; mimeType: string; size: number };
    type?: MediaType;
    isProtected?: boolean;
  }
) {
  const media = await MediaModel.findOne({ _id: mediaId, tenantId });
  if (!media) {
    throw new Error('Not found');
  }

  let replacedFile = false;

  if (opts.file) {
    validateUpload(opts.file.size);
    const newKey = `tenants/${tenantId}/media/${Date.now()}-${uuidv4()}-${opts.file.fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: newKey,
        Body: opts.file.buffer,
        ContentType: opts.file.mimeType,
      })
    );

    await safeDeleteFromS3(media.s3Key);
    if (media.derived?.thumbnailKey) {
      await safeDeleteFromS3(media.derived.thumbnailKey);
      delete media.derived.thumbnailKey;
    }

    media.fileName = opts.file.fileName;
    media.originalName = opts.file.fileName;
    media.mimeType = opts.file.mimeType;
    media.size = opts.file.size;
    media.s3Key = newKey;
    media.status = 'UPLOADED';
    replacedFile = true;

    // If type wasn't provided explicitly, infer from the new file.
    if (!opts.type) {
      media.type = detectMediaType({
        mimeType: opts.file.mimeType,
        fileName: opts.file.fileName,
      });
    }
  }

  if (opts.type) {
    media.type = opts.type;
  }
  if (typeof opts.isProtected === 'boolean') {
    media.isProtected = opts.isProtected;
  }

  await media.save();

  if (replacedFile) {
    const mediaIdStr = (media._id as unknown as { toString(): string }).toString();
    await enqueueProcessingJob({
      mediaId: mediaIdStr,
      tenantId: tenantId.toString(),
    });
  }

  const signedUrl = await getSignedGetUrl(BUCKET, media.s3Key, 300);
  return { ...media.toObject(), signedUrl };
}

// Delete media and associated S3 objects
export async function deleteMedia(tenantId: string, mediaId: string) {
  const media = await MediaModel.findOne({ _id: mediaId, tenantId });
  if (!media) {
    throw new Error('Not found');
  }

  await Promise.all([
    safeDeleteFromS3(media.s3Key),
    media.derived?.thumbnailKey ? safeDeleteFromS3(media.derived.thumbnailKey) : Promise.resolve(),
  ]);

  await MediaModel.deleteOne({ _id: mediaId, tenantId });
}

async function safeDeleteFromS3(key?: string) {
  if (!key) return;
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (err) {
    console.warn(`Failed to delete S3 object ${key}`, err);
  }
}
