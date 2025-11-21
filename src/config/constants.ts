import dotenv from 'dotenv';
import path from 'path';
// Determine the environment and load the corresponding file
// for local test, it uses `.env.local` while in production uses .env
// const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';

// dotenv.config({ path: envFile });

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
dotenv.config();
export const getEnvironmentVariable = (key: string, defaultVal?: string): string => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is undefined`);
  }
  return value;
};

export const getEnvironmentVariableNumber = (key: string, defaultVal?: number): number => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is undefined`);
  }
  return Number(value);
};

export const MONGO_URI = getEnvironmentVariable('MONGO_URI', '');
export const PORT = getEnvironmentVariableNumber('PORT', 5002);
export const JWT_SECRET = getEnvironmentVariable('JWT_SECRET', 'secret_key');
export const JWT_REFRESH_SECRET = getEnvironmentVariable('JwT_REFRESH_SECRET', 'secret_refresh');
export const NODE_ENV = getEnvironmentVariable('NODE_ENV', 'development');
export const ALLOWED_ORIGINS = getEnvironmentVariable('ALLOWED_ORIGINS', '*').split(',');
export const TRIAL_PERIOD_DAYS = getEnvironmentVariableNumber('TRIAL_PERIOD_DAYS', 30);
export const BCRYPT_ROUNDS = getEnvironmentVariableNumber('BCRYPT_ROUNDS', 12);
export const RATE_LIMIT_WINDOW = getEnvironmentVariableNumber('RATE_LIMIT_WINDOW', 15);
export const RATE_LIMIT_MAX = getEnvironmentVariableNumber('RATE_LIMIT_MAX_REQUESTS', 100);
export const SMTP_HOST = getEnvironmentVariable('SMTP_HOST', 'smtp.gmail.com');
export const SMTP_PORT = getEnvironmentVariableNumber('SMTP_PORT', 465);
export const SMTP_USER = getEnvironmentVariable('SMTP_USER', 'username');
export const SMTP_PASSWORD = getEnvironmentVariable('SMTP_PASSWORD', 'password');
export const FROM_EMAIL = getEnvironmentVariable('FROM_EMAIL', 'noreply@lms.com');
export const FROM_NAME = getEnvironmentVariable('FROM_NAME', 'Tutera Learning Platform');
export const JWT_ADMIN_SECRET = getEnvironmentVariable('JWT_ADMIN_SECRET', 'secret_key');
export const JWT_ADMIN_AUDIENCE = getEnvironmentVariable('JWT_ADMIN_AUDIENCE', 'admin');
export const FRONTEND_URL = getEnvironmentVariable('FRONTEND_URL', 'http://tuteraafrica.xyz');
