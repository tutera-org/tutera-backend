import fs from 'fs';
import path from 'path';
import handlebars, { type TemplateDelegate } from 'handlebars';
import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailEvent } from '../../templates/emailEvent.ts';
import type { TemplateVars as TV } from '../../templates/types.ts';
import { logger } from '../logger.ts';
import { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from '../constants.ts';

export type EmailAttachment = { filename: string; path: string };

// Transporter
export const emailTransporter: Transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

// Template directory
const templatesDir = path.resolve(process.cwd(), 'src/templates');

// Helpers
handlebars.registerHelper('uppercase', (v: unknown) =>
  typeof v === 'string' ? v.toUpperCase() : v
);

handlebars.registerHelper('formatDate', (v: unknown) => {
  const d = v instanceof Date || typeof v === 'string' ? new Date(v) : null;
  return d ? d.toLocaleDateString() : '';
});

// Register layout
const layoutPath = path.join(templatesDir, 'layout.hbs');
if (fs.existsSync(layoutPath)) {
  const layoutSource = fs.readFileSync(layoutPath, 'utf8');
  handlebars.registerPartial('layout', handlebars.compile(layoutSource));
}

/**
 * Compile template
 */
function compileTemplate<T extends EmailEvent>(templateName: T, data: TV[T]): string {
  const templatePath = path.join(templatesDir, `${templateName}.hbs`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found: ${templateName}`);
  }

  const source = fs.readFileSync(templatePath, 'utf8');
  const compiled: TemplateDelegate = handlebars.compile(source);

  const layout = handlebars.partials['layout'];
  if (!layout) {
    throw new Error('Layout partial is not registered.');
  }

  const rawHtml = compiled({
    ...data,
    year: new Date().getFullYear(),
  });

  return rawHtml;
}

/**
 * High-level email sending (HTML templates)
 */
export async function sendEmail<T extends EmailEvent>(
  to: string,
  subject: string,
  templateName: T,
  data: TV[T],
  attachments: EmailAttachment[] = []
): Promise<void> {
  const html = compileTemplate(templateName, data);

  try {
    const info = await emailTransporter.sendMail({
      from: FROM_EMAIL || SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });

    logger.info(`📨 Email sent → ${to} (${subject})`);
    logger.debug(info);
  } catch (err) {
    logger.error(`❌ Email send failed → ${to}`, err);
    throw err instanceof Error ? err : new Error('Unknown email error');
  }
}
