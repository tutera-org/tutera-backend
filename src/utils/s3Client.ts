// AWS SDK v3 S3 client for Wasabi
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT!;
const region = process.env.S3_REGION || 'us-east-1';

export const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function getUploadSignedUrl(bucket: string, key: string, expiresSec = 900) {
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresSec });
}

export async function getSignedGetUrl(bucket: string, key: string, expiresSec = 300) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresSec });
}

export async function headObject(bucket: string, key: string) {
  const cmd = new HeadObjectCommand({ Bucket: bucket, Key: key });
  return s3.send(cmd);
}

// Export PutObjectCommand for direct usage
export { PutObjectCommand };
