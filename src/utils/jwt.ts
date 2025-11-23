import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../interfaces/index.ts';
import type { Secret, SignOptions } from 'jsonwebtoken';
import {
  JWT_EXPIRE,
  JWT_REFRESH_EXPIRE,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from '../config/constants.ts';

export const generateToken = (payload: JwtPayload): string => {
  const secret: Secret = JWT_SECRET;
  // Handle NaN values by providing fallbacks
  const tokenExpire = isNaN(JWT_EXPIRE) ? 900 : JWT_EXPIRE; // 15 minutes fallback
  const refreshExpire = isNaN(JWT_REFRESH_EXPIRE) ? 604800 : JWT_REFRESH_EXPIRE; // 7 days fallback

  console.log('JWT_EXPIRE value:', JWT_EXPIRE, 'type:', typeof JWT_EXPIRE);
  console.log('JWT_REFRESH_EXPIRE value:', JWT_REFRESH_EXPIRE, 'type:', typeof JWT_REFRESH_EXPIRE);
  console.log('Using tokenExpire:', tokenExpire, 'refreshExpire:', refreshExpire);

  const options: SignOptions = { expiresIn: tokenExpire };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const refreshSecret: Secret = JWT_REFRESH_SECRET;
  const refreshExpire = isNaN(JWT_REFRESH_EXPIRE) ? 604800 : JWT_REFRESH_EXPIRE; // 7 days fallback

  const options: SignOptions = { expiresIn: refreshExpire };
  return jwt.sign(payload, refreshSecret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};

// // Generate password reset token
// UserSchema.methods.generatePasswordResetToken = function (): string {
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   this.resetPasswordToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//   return resetToken;
// };
