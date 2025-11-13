import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScheduledEmail extends Document {
  to: string;
  subject: string;
  templateName: string;
  data: Record<string, string | number | boolean | null>;
  scheduledTime: Date;
  sent: boolean;
  retryCount: number;
  lastError?: string;
  sentAt?: Date;
}

const ScheduledEmailSchema: Schema<IScheduledEmail> = new Schema<IScheduledEmail>({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  templateName: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  scheduledTime: { type: Date, required: true },
  sent: { type: Boolean, default: false },
  retryCount: { type: Number, default: 0 },
  lastError: { type: String },
  sentAt: { type: Date },
});

export const ScheduledEmail: Model<IScheduledEmail> = mongoose.model<IScheduledEmail>(
  'ScheduledEmail',
  ScheduledEmailSchema
);
