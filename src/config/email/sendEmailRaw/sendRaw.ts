import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from '../../constants.ts';

export const rawTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export async function sendEmailRaw({
  to,
  subject,
  html,
  text,
  attachments = [],
}: RawEmailOptions): Promise<void> {
  await rawTransporter.sendMail({
    from: SMTP_USER,
    to,
    subject,
    html,
    text,
    attachments,
  });
}

export interface RawEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: { filename: string; path: string }[];
}
