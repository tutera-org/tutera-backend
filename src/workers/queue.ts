import { Queue } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis(process.env.REDIS_URL!);

// bullmq Queue names cannot contain ':' on some systems — use a hyphen instead
export const mediaQueue = new Queue('media-processing', {
  connection,
  prefix: process.env.BULL_PREFIX || 'media',
});

export async function enqueueProcessingJob(payload: { mediaId: string; tenantId: string }) {
  await mediaQueue.add('process-media', payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}
