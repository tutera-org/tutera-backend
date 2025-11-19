import z from 'zod';

export const ContentSchema = z.object({
  type: z.enum(['TEXT', 'VIDEO', 'PDF', 'AUDIO']),
  body: z.string().optional(),
  mediaId: z.string().optional(),
});

export const LessonSchema = z.object({
  title: z.string().min(1),
  content: ContentSchema,
});

export const QuestionSchema = z.object({
  question: z.string().min(1),
  options: z
    .array(z.string().min(1))
    .length(4, { message: 'Each question must have exactly 4 options' }),
  correctAnswerIndex: z.number().min(0).max(3),
  explanation: z.string().optional(),
});

export const QuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(QuestionSchema).min(1),
});

export const ModuleSchema = z.object({
  title: z.string().min(1),
  lessons: z.array(LessonSchema).min(1),
  quiz: QuizSchema,
});

export const CourseInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  tenantId: z.string().min(1),
  createdBy: z.string().min(1),
  modules: z.array(ModuleSchema).min(1),
});
