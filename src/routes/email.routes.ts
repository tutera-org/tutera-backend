import express, { type Request, type Response } from 'express';
import { ScheduledEmail } from '../models/ScheduledEmail.ts';

const router = express.Router();

router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { to, subject, templateName, data, scheduledTime } = req.body as {
      to: string;
      subject: string;
      templateName: string;
      data: Record<string, string | number | boolean | null>;
      scheduledTime: string;
    };

    const email = new ScheduledEmail({
      to,
      subject,
      templateName,
      data,
      scheduledTime: new Date(scheduledTime),
    });

    await email.save();
    res.status(200).json({ message: 'Email scheduled successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to schedule email' });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  const emails = await ScheduledEmail.find({})
    .select('to subject sent retryCount scheduledTime lastError sentAt')
    .lean();
  res.json(emails);
});

export default router;
