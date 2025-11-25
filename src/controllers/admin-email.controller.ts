import type { Request, Response } from 'express';
import { ScheduledEmail } from '../models/ScheduledEmail.ts';
import { logger } from '../config/logger.ts';

export async function getFailedEmails(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Number(req.query.limit ?? 25));
  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      ScheduledEmail.find({ sent: false, retryCount: { $gte: 3 } })
        .sort({ scheduledTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ScheduledEmail.countDocuments({ sent: false, retryCount: { $gte: 3 } }),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    logger.error('Failed to fetch failed emails', err);
    res.status(500).json({ error: 'Failed to fetch failed emails' });
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const [queued, sent, failed] = await Promise.all([
      ScheduledEmail.countDocuments({ sent: false }),
      ScheduledEmail.countDocuments({ sent: true }),
      ScheduledEmail.countDocuments({ sent: false, retryCount: { $gte: 3 } }),
    ]);
    res.json({ queued, sent, failed });
  } catch (err) {
    logger.error('Failed to fetch email stats', err);
    res.status(500).json({ error: 'Failed to fetch email stats' });
  }
}
