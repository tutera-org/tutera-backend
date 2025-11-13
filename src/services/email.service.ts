import cron from 'node-cron';
import { ScheduledEmail } from '../models/ScheduledEmail.ts';
import { sendEmail } from '../config/email/sendEmail.ts';
import { logger } from '../config/logger.ts';

export function scheduleEmails(): void {
  cron.schedule('*/5 * * * *', async () => {
    const emails = await ScheduledEmail.find({
      sent: false,
      scheduledTime: { $lte: new Date() },
      retryCount: { $lt: 3 },
    });

    for (const email of emails) {
      try {
        await sendEmail(email.to, email.subject, email.templateName, email.data);
        await ScheduledEmail.findByIdAndUpdate(email._id, {
          sent: true,
          sentAt: new Date(),
        });
        logger.info(`Email sent to ${email.to}`);
      } catch (err) {
        const message: string = err instanceof Error ? err.message : 'Unknown error';
        await ScheduledEmail.findByIdAndUpdate(email._id, {
          $inc: { retryCount: 1 },
          lastError: message,
        });
        logger.error(`Failed to send email to ${email.to}:`, message);
      }
    }
  });
}
