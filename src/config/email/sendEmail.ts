import fs from 'fs';
import path from 'path';
import handlebars, { type TemplateDelegate } from 'handlebars';
import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../logger.ts';
import { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from '../constants.ts';

export type TemplateData = Record<string, string | number | boolean | null>;

// Configure Nodemailer transporter
export const emailTransporter: Transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

// Register global helpers
handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
handlebars.registerHelper('formatDate', (date: string | Date) =>
  new Date(date).toLocaleDateString()
);

// Register layout and partials once at startup
const templatesDir = path.resolve(process.cwd(), 'src/templates');
handlebars.registerPartial(
  'layout',
  fs.readFileSync(path.join(templatesDir, 'layout.hbs'), 'utf8')
);

// Register layout.hbs as a partial
const layoutPath = path.join(templatesDir, 'layout.hbs');
const layoutSource = fs.readFileSync(layoutPath, 'utf8');
handlebars.registerPartial('layout', handlebars.compile(layoutSource));

// Helper: compile child template with layout
function compileTemplate(templateName: string, data: TemplateData): string {
  const templatePath = path.join(templatesDir, `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, { encoding: 'utf8' });

  const compiled: TemplateDelegate = handlebars.compile(source);
  return compiled({
    ...data,
    year: new Date().getFullYear(),
  });
}

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: TemplateData
): Promise<void> => {
  const html: string = compileTemplate(templateName, data);
  try {
    await emailTransporter.sendMail({
      from: FROM_EMAIL || 'noreply@tutera.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};
