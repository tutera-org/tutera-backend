import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import type { TemplateVars } from '../templates/types.ts';
import type { EmailEvent } from '../templates/emailEvent.ts';
import type { EmailAttachment } from '../config/email/sendEmail.ts';

export interface ScheduledEmailData {
  [key: string]: unknown;
}

export interface IScheduledEmail {
  to: string;
  subject: string;
  templateName: EmailEvent;
  data: TemplateVars[EmailEvent];
  scheduledTime: Date;
  sent: boolean;
  retryCount: number;
  lastError?: string;
  sentAt?: Date;
  attachments?: EmailAttachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type IScheduledEmailDoc = HydratedDocument<IScheduledEmail>;
export type IScheduledEmailLean = IScheduledEmail & { _id: string };

const ScheduledEmailSchema = new Schema<IScheduledEmail>(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    templateName: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    scheduledTime: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
    lastError: { type: String },
    sentAt: { type: Date },
    attachments: [
      {
        filename: { type: String, required: false },
        path: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);

ScheduledEmailSchema.index({ sent: 1, scheduledTime: 1, retryCount: 1 });

export const ScheduledEmail: Model<IScheduledEmail> = model<IScheduledEmail>(
  'ScheduledEmail',
  ScheduledEmailSchema
);
