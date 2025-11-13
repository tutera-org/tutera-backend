import { z } from 'zod';
import { SubscriptionPlan } from '../interfaces/index.ts';

export const createTenantSchema = z.object({
  name: z.string().min(3, 'Tenant name must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['institution', 'independent_user']),
  domain: z.string().optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  domain: z.string().optional(),
  settings: z
    .object({
      primaryColor: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
      secondaryColor: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i)
        .optional(),
      allowDownload: z.boolean().optional(),
      customDomain: z.string().optional(),
      emailNotifications: z.boolean().optional(),
      maxStudents: z.number().positive().optional(),
    })
    .optional(),
});

export const subscribeSchema = z.object({
  subscriptionType: z.enum(SubscriptionPlan),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
});
