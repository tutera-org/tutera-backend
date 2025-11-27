# Tutera Media Upload Guide

## Overview
The backend now owns the entire media lifecycle for lessons: uploads arrive via multipart requests, the API streams files to Wasabi/S3, metadata is persisted in MongoDB, and a BullMQ worker handles thumbnails or other derivatives before learners consume the content. This document replaces previous guides and explains how to implement, configure, and use every feature in the media stack.

## End-to-End Flow
1. **Creator selects a file in the lesson builder.**
2. Frontend calls `POST /api/v1/media/upload` with the file (and optional metadata).
3. API validates size/type, uploads to S3, stores a `Media` record, enqueues a processing job, and returns `{ mediaId, signedUrl }`.
4. Frontend uses `mediaId` as `contentId` when creating or updating a lesson.
5. Worker downloads the file from S3, produces derivatives (e.g., video thumbnail), and marks the record `READY`.
6. Learners fetch media via `GET /api/v1/media/{id}`; the API issues a short-lived signed URL (or a public URL if the asset is not protected).

## Key Behaviors
- **Supported types**: `VIDEO`, `IMAGE`, `DOCUMENT`, `AUDIO` (auto-detected via MIME/extension; optional override allowed).
- **Size limit**: `MAX_UPLOAD_SIZE` env var (defaults to 2 GB) is enforced by both Multer and service validation.
- **Security**: All routes require authentication; protected assets are served through signed URLs that expire quickly, so learners cannot download permanent links.
- **Storage layout**: Files are stored at `tenants/{tenantId}/media/{timestamp}-{uuid}-{originalName}`.
- **Processing queue**: `media-processing` BullMQ queue enqueues every upload (and any file replacement) for background work.

## API Endpoints
All routes live under `/api/v1/media` and expect `Authorization: Bearer <JWT>`.

| Method & Path | Description | Notes |
| --- | --- | --- |
| `POST /upload` | Upload a file (multipart). | Body fields: `file` (required), `type` (optional override), `isProtected` (optional). Returns `{ mediaId, signedUrl, status, s3Key, fileName, type }`. |
| `GET /` | List media for the authenticated tenant. | Query params: `page` (default 1), `limit` (default 10, max 100). Returns paginated payload. |
| `GET /{id}` | Fetch a single media record. | Protected assets include `signedUrl`; public ones include `url`. |
| `PUT /{id}` | Update metadata and/or replace the file. | Accepts multipart file (optional). Replaces S3 object, removes old derivatives, and requeues processing if a new file is supplied. |
| `DELETE /{id}` | Delete media. | Removes DB record plus the primary object and thumbnail/derived keys in S3. |

## Worker Responsibilities
`src/workers/worker.ts` subscribes to the `media-processing` queue:
- Marks media as `PROCESSING`, downloads the file from S3 to a temp directory.
- For videos, extracts a thumbnail via `ffmpeg` and uploads it back to S3.
- Updates `media.derived.thumbnailKey`, marks status `READY`, and cleans temp files.
- Logs success/failure for observability.

The queue is configured in `src/workers/queue.ts` with exponential retry (3 attempts) and a configurable Redis connection string (`REDIS_URL`). Ensure Redis is running whenever uploads occur.

## Frontend Integration
```typescript
async function uploadMedia(file: File, token: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isProtected', 'true');  // optional (default true)

  const res = await fetch('/api/v1/media/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  return res.json(); // { mediaId, signedUrl, ... }
}

async function createLesson(payload: LessonInput, token: string) {
  const res = await fetch('/api/v1/courses/lessons', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Lesson creation failed');
  return res.json();
}

// Usage in UI
const { mediaId, signedUrl } = await uploadMedia(selectedFile, token);
await createLesson({ ...lessonFields, contentId: mediaId }, token);
```
- Store `mediaId` immediately after upload and surface `signedUrl` for previews.
- When learners load a lesson, call `GET /api/v1/media/{id}` to obtain a fresh signed URL for playback. Even though URLs expire (default 5 minutes), the frontend can request a new URL on demand since the media record remains intact.

## Handling Signed URL Expiration
Signed URLs are intentionally short-lived to protect content. Learners should not rely on cached URLs for hours; instead, the frontend should:
1. Request lesson data (which includes `contentId`).
2. Call `GET /api/v1/media/{contentId}` just before playback.
3. Use the freshly issued `signedUrl`. If playback spans longer than the expiry, request a new URL (e.g., on player `onError` event) and resume streaming. No additional presign flow is required; the backend endpoint already acts as the signer.

If you prefer publicly accessible assets, upload with `isProtected=false`. In that case `GET /media/{id}` returns a stable `url`, and no signed URL refresh is needed (but the asset is viewable by anyone who learns the link).

## Environment Variables
Add or verify the following entries in your environment file:
```
S3_BUCKET=your-bucket
S3_ENDPOINT=https://s3.wasabisys.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
MAX_UPLOAD_SIZE=2147483648        # 2 GB default
ALLOWED_MIME_TYPES=video/mp4,video/webm,image/jpeg,image/png,application/pdf
REDIS_URL=redis://:password@localhost:6379/0
THUMBNAIL_TMP_DIR=/tmp/media-processing
FFMPEG_BIN=/usr/bin/ffmpeg
```

## Testing Checklist
1. `npm install`
2. `npm run dev` (API) + start the BullMQ worker (`ts-node src/workers/worker.ts` or equivalent).
3. Use Postman or cURL to:
   - Authenticate and capture the JWT.
   - Upload media, create a lesson referencing `mediaId`.
   - Poll `GET /media/{id}` until status becomes `READY`.
   - Replace or delete media to verify S3 cleanup and queue re-processing.

## Troubleshooting
- **"File too large"**: Increase `MAX_UPLOAD_SIZE` (and ensure infrastructure can handle the RAM/disk needs if still using Multer memory storage).
- **Worker stuck**: Confirm Redis connectivity and install `ffmpeg` on the worker host.
- **Playback fails after some time**: Refresh by calling `GET /media/{id}` to get a new signed URL; implement retry logic in the player.

## Signed URL Behavior
Learners can always view uploaded media—even hours later—because playback simply involves calling GET /api/v1/media/{id} right before rendering. That endpoint issues a fresh signed URL each time (or a permanent public URL when isProtected=false). Even though individual signed URLs expire within minutes, the frontend can request new ones on demand; there’s no need for a separate presign flow beyond the existing API. Implement retry logic client-side (e.g., if the player encounters a 403, fetch a new URL and resume).

This `README` is the authoritative reference for the media subsystem. Remove prior guides/documents and keep this file updated whenever the flow changes.