import { model, Schema } from 'mongoose';
import type { INotification } from '../interfaces/index.ts';

const NotificationSchema = new Schema<INotification>(
  {
    userId: String,
    message: String,
    type: { type: String, default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 259200 }, // TTL: 3 day
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
