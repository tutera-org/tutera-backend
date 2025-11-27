import { handleEmailEvent } from '../templates/emailEvent.ts';
import { logger } from '../config/logger.ts';
import { Otp, type OtpDoc } from '../models/otp.ts';
import { User, type UserDoc } from '../models/User.ts';

function generateOtp(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function createOtp(userId: string): Promise<string> {
  // Throttle: max 3 OTPs per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await Otp.countDocuments({
    userId,
    createdAt: { $gte: oneHourAgo },
  });

  if (recentCount >= 3) {
    throw new Error('Too many OTP requests. Please try again later.');
  }

  // Remove old OTPs
  await Otp.deleteMany({ userId });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  const otp = new Otp({ userId, code, expiresAt, used: false });
  await otp.save();

  // Send OTP via email
  const user: UserDoc | null = await User.findById(userId);
  if (!user) throw new Error('User not found');

  await handleEmailEvent('user.passwordReset', {
    to: user.email,
    data: { code: code, name: user.firstName || user.fullName, expires: 5 },
  });

  return code;
}

export async function verifyOtp(userId: string, otpCode: string): Promise<boolean> {
  const user: UserDoc | null = await User.findById(userId);
  if (!user) return false;

  // Check lock status
  if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
    throw new Error('Too many failed attempts. Try again later.');
  }

  const otp: OtpDoc | null = await Otp.findOne({ userId, code: otpCode, used: false });
  if (!otp || otp.expiresAt < new Date()) {
    // Failed attempt
    user.failedOtpAttempts = (user.failedOtpAttempts || 0) + 1;

    if (user.failedOtpAttempts >= 5) {
      user.otpLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 min
      user.failedOtpAttempts = 0;
    }
    // Send alert email
    try {
      await handleEmailEvent('user.violation', {
        to: user.email,
        data: {
          name: user.firstName || user.tenantName,
        },
      });
    } catch (e) {
      logger.warn('Failed to send OTP lock alert email', { error: e });
    }

    await user.save();
    return false;
  }

  // Success
  user.failedOtpAttempts = 0;
  await user.save();

  otp.used = true;
  await otp.save();

  return true;
}
