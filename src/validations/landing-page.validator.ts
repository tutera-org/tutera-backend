import { z } from 'zod';

export const testimonialSchema = z.object({
  image: z.string().url().optional().default(''),
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Job title cannot exceed 100 characters'),
  remark: z.string().min(1, 'Remark is required').max(500, 'Remark cannot exceed 500 characters'),
});

export const createLandingPageSchema = z.object({
  logo: z.string().url().optional().default(''),
  sections: z
    .object({
      section1: z
        .object({
          image: z.string().url().optional().default(''),
        })
        .optional(),
      section2: z
        .object({
          description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .optional()
            .default(''),
          image: z.string().url().optional().default(''),
        })
        .optional(),
      section3: z
        .object({
          description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .optional()
            .default(''),
          image: z.string().url().optional().default(''),
        })
        .optional(),
      section4: z
        .object({
          title: z.string().max(200, 'Title cannot exceed 200 characters').optional().default(''),
          description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .optional()
            .default(''),
          image: z.string().url().optional().default(''),
        })
        .optional(),
      section5: z
        .object({
          testimonials: z
            .array(testimonialSchema)
            .max(10, 'Cannot have more than 10 testimonials')
            .optional()
            .default([]),
        })
        .optional(),
    })
    .optional(),
});

export const updateLandingPageSchema = z.object({
  logo: z.string().url().optional(),
  sections: z
    .object({
      section1: z
        .object({
          image: z.string().url().optional(),
        })
        .optional(),
      section2: z
        .object({
          description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
          image: z.string().url().optional(),
        })
        .optional(),
      section3: z
        .object({
          description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
          image: z.string().url().optional(),
        })
        .optional(),
      section4: z
        .object({
          title: z.string().max(200, 'Title cannot exceed 200 characters').optional(),
          description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
          image: z.string().url().optional(),
        })
        .optional(),
      section5: z
        .object({
          testimonials: z
            .array(testimonialSchema)
            .max(10, 'Cannot have more than 10 testimonials')
            .optional(),
        })
        .optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateLandingPageInput = z.infer<typeof createLandingPageSchema>;
export type UpdateLandingPageInput = z.infer<typeof updateLandingPageSchema>;
