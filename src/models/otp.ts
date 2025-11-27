import mongoose, { Schema, Document } from 'mongoose';

export interface OtpDoc extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  expiresAt: Date;
  failedOtpAttempts: number;
  otpLockedUntil?: Date;
  used: boolean;
}

const otpSchema = new Schema<OtpDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  failedOtpAttempts: { type: Number, default: 0 },
  otpLockedUntil: { type: Date },
  used: { type: Boolean, default: false },
});

export const Otp = mongoose.model<OtpDoc>('Otp', otpSchema);
