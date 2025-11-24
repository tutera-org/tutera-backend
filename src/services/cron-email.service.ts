import cron from 'node-cron';
import mongoose from 'mongoose';
import { ScheduledEmail, type IScheduledEmailLean } from '../models/ScheduledEmail.ts';
import { MONGO_URI } from '../config/constants.ts';
import { logger } from '../config/logger.ts';
import { EmailService } from '../lib/email/email.services.ts';

const MAX_RETRIES = 3;

export function startEmailCron(): void {
  // Ensure DB connected
  if (mongoose.connection.readyState === 0) {
    mongoose
      .connect(MONGO_URI)
      .then(() => logger.info('Connected to MongoDB for email cron'))
      .catch((err) => {
        logger.error('Failed to connect to Mongo for email cron', err);
        throw err;
      });
  }

  logger.info('Scheduling email cron: running every 1 minute');

  cron.schedule('* * * * *', async () => {
    logger.info('Cron heartbeat: scanning for pending emails...');

    try {
      const now = new Date();

      const pending = await ScheduledEmail.find({
        sent: false,
        scheduledTime: { $lte: now },
        retryCount: { $lt: MAX_RETRIES },
      })
        .limit(100)
        .lean<IScheduledEmailLean[]>()
        .exec();

      logger.info(`Pending emails found: ${pending.length}`);
      // SEND EMAIL using new email service

      void Promise.allSettled(pending.map((p) => EmailService.retryFailed(p)));
    } catch (err) {
      logger.error('Cron processing failed', err);
    }
  });
}
