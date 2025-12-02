import { Schema, model, Document } from 'mongoose';

export type MediaType = 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'AUDIO';
export type MediaStatus = 'PENDING' | 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';

export interface IMedia extends Document {
  tenantId: object;
  uploadedBy?: object;
  fileName: string;
  originalName?: string;
  mimeType: string;
  size: number;
  s3Key: string;
  type: MediaType;
  isProtected: boolean;
  status: MediaStatus;
  metadata?: Record<string, unknown>;
  derived?: {
    thumbnailKey?: string;
    transcodedKeys?: Record<string, string>;
  };
}

const MediaSchema = new Schema<IMedia>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    fileName: { type: String, required: false },
    originalName: { type: String },
    mimeType: { type: String, required: false },
    size: { type: Number, required: false },
    s3Key: { type: String, required: false, index: true },
    type: { type: String, enum: ['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'], required: false },
    isProtected: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['PENDING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED'],
      default: 'PENDING',
    },
    metadata: { type: Schema.Types.Mixed },
    derived: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

MediaSchema.index({ tenantId: 1, s3Key: 1 });

export const MediaModel = model<IMedia>('Media', MediaSchema);
