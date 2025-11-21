import { z } from 'zod';
import { UserRole } from '../interfaces/index.ts';

// Nigerian phone number validator: accepts numbers starting with 0 and transforms to +234
const nigerianPhoneSchema = z.preprocess(
  (input) => {
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (/^0(70|71|80|81|90|91)[0-9]{8}$/.test(trimmed)) {
        return '+234' + trimmed.slice(1);
      }
    }
    return input;
  },
  z.string().regex(/^\+234(70|71|80|81|90|91)[0-9]{8}$/, 'Invalid Nigerian mobile number')
);

export const registerSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  role: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase()) // normalize case first
    .refine((v) => Object.values(UserRole).includes(v as UserRole), {
      message: 'Role must be SUPER_ADMIN, INSTITUTION, or INDEPENDENT_CREATOR',
    })
    .transform((v) => v as UserRole),
  phoneNumber: nigerianPhoneSchema.optional(),
  tenantName: z.string().min(3, 'Tenant name must be at least 3 characters'),
});

export const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z
    .string()
    .min(8, 'Password is required')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
      'Password must be at least 8 characters'
    ),
});

export const learnerRegisterSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  tenantId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tenant ID'),
  phoneNumber: z.string().optional(),
});

export const updateUserDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phoneNumber: nigerianPhoneSchema.optional(),
  avatar: z.url('Avatar must be a valid URL').optional(),
});
