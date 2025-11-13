import mongoose from 'mongoose';
import { logger } from './logger.ts';
import { MONGO_URI } from '../config/constants.ts';

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = MONGO_URI;
    mongoose.Promise = global.Promise;
    console.log('Connecting to MongoDB ...');
    mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}
