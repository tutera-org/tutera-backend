import nodemailer from 'nodemailer';
import { logger } from '../config/logger.ts';

export const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@tutera.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};
