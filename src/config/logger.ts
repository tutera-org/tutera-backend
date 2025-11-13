import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Ensure log directory exists
const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🧩 Define log level based on environment
const level: string = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// 🧩 Create custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),

  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level}] ${message}\n${stack}`
      : `${timestamp} [${level}] ${message}`;
  })
);

// 🧩 Create the Winston logger
export const logger = winston.createLogger({
  level,
  format: logFormat,
  defaultMeta: { service: 'tutera-lms' },
  transports: [
    // Separate error and combined logs using daily rotation
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
    }),
  ],
});

// 🧩 Add colorized console output in non-production
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return stack
            ? `${timestamp} [${level}] ${message}\n${stack}`
            : `${timestamp} [${level}] ${message}`;
        })
      ),
    })
  );
}

// const logFormat = winston.format.combine(
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.errors({ stack: true }),
//   winston.format.splat(),
//   winston.format.json(),
// );

// const consoleFormat = winston.format.combine(
//   winston.format.colorize(),
//   winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//   winston.format.printf(({ timestamp, level, message, ...metadata }) => {
//     let msg = `${timestamp} [${level}]: ${message}`;
//     if (Object.keys(metadata).length > 0) {
//       msg += ` ${JSON.stringify(metadata)}`;
//     }
//     return msg;
//   })
// );

// const transports: winston.transport[] = [
//   new winston.transports.Console({
//     format: consoleFormat,
//     level: config.env === 'production' ? 'info' : 'debug',
//   }),
// ];

// if (config.env !== 'test') {
//   transports.push(
//     new DailyRotateFile({
//       filename: path.join('logs', 'error-%DATE%.log'),
//       datePattern: 'YYYY-MM-DD',
//       level: 'error',
//       maxSize: '20m',
//       maxFiles: '14d',
//       format: logFormat,
//     }),
//     new DailyRotateFile({
//       filename: path.join('logs', 'combined-%DATE%.log'),
//       datePattern: 'YYYY-MM-DD',
//       maxSize: '20m',
//       maxFiles: '14d',
//       format: logFormat,
//     })
//   );
// }

// const logger = winston.createLogger({
//   level: config.env === 'production' ? 'info' : 'debug',
//   format: logFormat,
//   transports,
//   exitOnError: false,
// });

// export default logger;
