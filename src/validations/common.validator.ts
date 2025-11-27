import { z } from 'zod';

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).default(1),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});
