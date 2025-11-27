import { Types } from 'mongoose';
import { AuditLog } from '../models/AuditLog.ts';
import { logger } from '../config/logger.ts';

export const createAuditLog = async (
  userId: Types.ObjectId,
  action: string,
  resource: string,
  resourceId?: Types.ObjectId,
  details?: Record<string, unknown>,
  tenantId?: Types.ObjectId,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await AuditLog.create({
      userId,
      tenantId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};
