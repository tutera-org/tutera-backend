import { connectDatabase } from './config/database.ts';
import { scheduleEmails } from './services/email.service.ts';
import { logger } from './config/logger.ts';
import app from './app.ts';
import { PORT } from './config/constants.ts';
import { createServer } from 'node:http';
import { initSocket } from './sockets/index.ts';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    scheduleEmails();
    const server = createServer(app);
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      logger.info(`
          ╔══════════════════════════════════════════════════════════════════╗
          ║   Tutera LMS Server Started Successfully                         ║
          ╠══════════════════════════════════════════════════════════════════╣
          ║   Environment: ${process.env.NODE_ENV?.toUpperCase().padEnd(28)}                      ║
          ║   Port: ${PORT.toString().padEnd(34)}                       ║
          ║   API Docs: http://localhost:${PORT}/api/v1/docs                    ║
          ╚══════════════════════════════════════════════════════════════════╝
          `);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`\n${signal} signal received: closing HTTP server`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: Error, promise: Promise<void>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
