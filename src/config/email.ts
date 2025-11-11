import nodemailer from 'nodemailer';
import { logger } from '../config/logger.ts';
import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER, FROM_EMAIL } from './constants.ts';

export const emailTransporter = nodemailer.createTransport({
  host: SMTP_HOST || 'smtp.example.com',
  port: SMTP_PORT || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await emailTransporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};
