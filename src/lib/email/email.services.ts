import { sendEmail } from '../../config/email/sendEmail.ts';
import {
  ScheduledEmail,
  type IScheduledEmailDoc,
  type IScheduledEmailLean,
} from '../../models/ScheduledEmail.ts';
import { logger } from '../../config/logger.ts';
import type { EmailEvent } from '../../templates/emailEvent.ts';
import type { TemplateVars } from '../../templates/types.ts';

export type EmailQueueParams<T extends EmailEvent> = {
  to: string;
  subject?: string;
  template: T;
  data: TemplateVars[T];
  attachments?: { filename: string; path: string }[];
  scheduledTime?: Date;
};

/**
 * EmailService: queue, send, and manage emails
 */
export class EmailService {
  /**
   * Queue an email to be sent via ScheduledEmail
   */
  static async queueEmail<T extends EmailEvent>(params: EmailQueueParams<T>) {
    const doc = new ScheduledEmail({
      to: params.to,
      subject: params.subject,
      templateName: params.template,
      data: params.data,
      attachments: params.attachments ?? [],
      scheduledTime: params.scheduledTime ?? new Date(),
      retryCount: 0,
      sent: false,
    });

    const saved = await doc.save();
    logger.info(`Email queued for ${params.to} → template: ${params.template}`);
    return saved as IScheduledEmailDoc;
  }

  /**
   * Send an email immediately (template + attachments)
   */
  static async sendNow<T extends EmailEvent>(params: EmailQueueParams<T>) {
    try {
      await sendEmail(
        params.to,
        params.subject ?? '',
        params.template,
        params.data,
        params.attachments ?? []
      );
      logger.info(`Email sent immediately to ${params.to} → template: ${params.template}`);
    } catch (err) {
      logger.error(`Immediate send failed for ${params.to}`, err);
      throw err;
    }
  }

  /**
   * Send OTP email
   */
  static async sendOtpEmail(to: string, otpCode: string, expiresInMinutes = 5) {
    return this.queueEmail({
      to,
      subject: 'Your OTP Code',
      template: 'user.passwordReset',
      data: {
        name: 'name',
        code: otpCode,
        expires: expiresInMinutes,
      },
    });
  }

  /**
   * Retry failed emails from ScheduledEmail
   */
  static async retryFailed(email: IScheduledEmailDoc | IScheduledEmailLean) {
    try {
      const template = email.templateName;
      const data = email.data;

      await sendEmail(email.to, email.subject ?? '', template, data, email.attachments ?? []);

      await ScheduledEmail.updateOne(
        { _id: email._id },
        { sent: true, sentAt: new Date(), lastError: null }
      ).exec();
      logger.info(`Retried email sent to ${email.to}`);
    } catch (err) {
      const prev = email.retryCount ?? 0;
      const RETRY_MINUTES = [1, 3, 5];

      const nextRetry = prev + 1;
      const delayMinutes: number = RETRY_MINUTES[
        Math.min(prev, RETRY_MINUTES.length - 1)
      ] as number;
      await ScheduledEmail.updateOne(
        { _id: email._id },
        {
          $set: {
            retryCount: nextRetry,
            lastError: err instanceof Error ? err.message : String(err),
            scheduledTime: new Date(Date.now() + delayMinutes * 60_000),
          },
        }
      ).exec();
    }
  }
}
export const emailService = EmailService;
