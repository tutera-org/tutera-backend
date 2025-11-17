import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../interfaces/index.ts';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { JWT_REFRESH_SECRET, JWT_SECRET } from '../config/constants.ts';

export const generateToken = (payload: JwtPayload): string => {
  const secret: Secret = JWT_SECRET;
  const options: SignOptions = { expiresIn: '7d' };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const refreshSecret: Secret = JWT_REFRESH_SECRET;
  const options: SignOptions = { expiresIn: '15m' };
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
