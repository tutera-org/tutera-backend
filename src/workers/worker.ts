import { Worker } from 'bullmq';
import { MediaModel } from '../models/Media.ts';
import { s3 } from '../utils/s3Client.ts';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import ffmpeg from 'fluent-ffmpeg';
import type { Readable } from 'stream';
// import streamToPromise from 'stream-to-promise'; // small helper or implement stream piping

const BUCKET = process.env.S3_BUCKET!;
const TMP = process.env.THUMBNAIL_TMP_DIR || os.tmpdir();

const worker = new Worker(
  'media-processing',
  async (job) => {
    const { mediaId, tenantId } = job.data;
    const media = await MediaModel.findOne({ _id: mediaId, tenantId });
    if (!media) throw new Error('Media not found');

    media.status = 'PROCESSING';
    await media.save();

    const key = media.s3Key;
    const downloadPath = path.join(TMP, `${mediaId}-${media.fileName}`);
    // Download object to tmp file
    const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const res = await s3.send(getCmd);
    const body = res.Body as Readable; // stream
    const outStream = fs.createWriteStream(downloadPath);
    await new Promise((resolve, reject) => {
      body
        .pipe(outStream)
        .on('finish', () => resolve(undefined))
        .on('error', reject);
    });

    // Example: create thumbnail for video/image using ffmpeg or sharp
    if (media.type === 'VIDEO') {
      const thumbPath = path.join(TMP, `${mediaId}-thumb.jpg`);
      await new Promise((resolve, reject) => {
        ffmpeg(downloadPath)
          .screenshots({ count: 1, folder: TMP, filename: `${mediaId}-thumb.jpg`, size: '320x240' })
          .on('end', resolve)
          .on('error', reject);
      });

      // upload thumbnail
      const thumbKey = key + '.thumbnail.jpg';
      const thumbStream = fs.createReadStream(thumbPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: thumbKey,
          Body: thumbStream,
          ContentType: 'image/jpeg',
        })
      );

      media.derived = media.derived || {};
      media.derived.thumbnailKey = thumbKey;
    }

    // mark ready
    media.status = 'READY';
    await media.save();

    // cleanup local files
    try {
      fs.unlinkSync(downloadPath);
    } catch (err) {
      console.warn('Failed to delete temp file', err, downloadPath);
    }
  },
  { connection: { url: process.env.REDIS_URL! }, concurrency: 2 }
);
worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with error ${err.message}`);
});

export default worker;
