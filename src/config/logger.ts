import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'tutera-lms' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
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
