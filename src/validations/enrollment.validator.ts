import { z } from 'zod';

// Complete Lesson Schema
export const completeLessonSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid courseId format'),
  lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lessonId format'),
});

// Rate Course Schema
export const rateCourseSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid courseId format'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});

// Submit Quiz Attempt Schema
export const submitQuizAttemptSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid courseId format'),
  quizId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid quizId format'),
  answers: z
    .array(
      z.object({
        questionIndex: z.number().int().min(0, 'Question index must be non-negative'),
        selectedOptionIndex: z.number().int().min(0, 'Option index must be non-negative'),
      })
    )
    .min(1, 'At least one answer is required'),
});

// Enroll Student Schema
export const enrollStudentSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid courseId format'),
});
