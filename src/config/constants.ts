import dotenv from 'dotenv';

// Determine the environment and load the corresponding file
// for local test, it uses `.env.local` while in production uses .env
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: envFile });

export const getEnvironmentVariable = (
  key: string,
  defaultVal?: string
): string => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is undefined`);
  }
  return value;
};

export const getEnvironmentVariableNumber = (
  key: string,
  defaultVal?: number
): number => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is undefined`);
  }
  return Number(value);
};

export const MONGO_URI = getEnvironmentVariable('MONGO_URI', '');
export const PORT = getEnvironmentVariableNumber('PORT', 5002);
export const JWT_SECRET = getEnvironmentVariable('JWT_SECRET', 'secret_key');
export const JWT_REFRESH_SECRET = getEnvironmentVariable(
  'JwT_REFRESH_SECRET',
  'secret_refresh'
);
export const NODE_ENV = getEnvironmentVariable('NODE_ENV', 'development');
export const ALLOWED_ORIGINS = getEnvironmentVariable(
  'ALLOWED_ORIGINS',
  'http://localhost:3000'
).split(',');
