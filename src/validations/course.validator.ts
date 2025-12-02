import z from 'zod';

// Lesson Content Schema (matches database structure)
export const LessonContentSchema = z.object({
  _id: z.string().optional(), // Optional for creation, required for updates
  tenantId: z.string().optional(), // Usually set by backend
  moduleId: z.string().optional(), // Usually set by backend
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional(),
  type: z.enum(['VIDEO', 'TEXT', 'PDF', 'AUDIO']),
  order: z.number().int().min(1, 'Lesson order must be a positive integer'),
  contentId: z.string().nullable().optional(),
  duration: z.number().int().min(0, 'Lesson duration must be non-negative').optional(),
  isPreview: z.boolean().optional(),
});

// Quiz Question Schema (matches database structure)
export const QuizQuestionSchema = z.object({
  _id: z.string().optional(), // Optional for creation, required for updates
  questionText: z.string().min(1, 'Question text is required'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).length(4, {
    message: 'Each question must have exactly 4 options',
  }),
  correctAnswerIndex: z
    .number()
    .int()
    .min(0)
    .max(3, 'Correct answer index must be between 0 and 3'),
});

// Quiz Schema (matches database structure)
export const QuizSchema = z.object({
  _id: z.string().optional(), // Optional for creation, required for updates
  moduleId: z.string().optional(), // Usually set by backend
  tenantId: z.string().optional(), // Usually set by backend
  questions: z.array(QuizQuestionSchema).min(1, 'Quiz must have at least one question'),
  isPublished: z.boolean().optional(),
});

// Module Schema (matches database structure)
export const ModuleSchema = z.object({
  _id: z.string().optional(), // Optional for creation, required for updates
  tenantId: z.string().optional(), // Usually set by backend
  courseId: z.string().optional(), // Usually set by backend
  title: z.string().min(1, 'Module title is required'),
  order: z.number().int().min(1, 'Module order must be a positive integer'),
  lessons: z.array(LessonContentSchema).min(1, 'Module must have at least one lesson'),
  quiz: QuizSchema.optional(),
});

// Course Creation Schema (minimal required fields for creation)
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Course title is required')
    .max(200, 'Course title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  coverImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  modules: z.array(ModuleSchema).min(1, 'Course must have at least one module'),
});

// Course Update Schema (PUT - full update with database structure)
export const updateCourseSchema = z.object({
  _id: z.string().optional(), // Optional for updates
  tenantId: z.string().optional(), // Usually set by backend
  title: z
    .string()
    .min(1, 'Course title is required')
    .max(200, 'Course title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  coverImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  totalEnrollments: z.number().int().min(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
  slug: z.string().optional(),
  modules: z.array(ModuleSchema).min(1, 'Course must have at least one module'),
});

// Course Partial Update Schema (PATCH)
export const patchCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'Course title is required')
    .max(200, 'Course title cannot exceed 200 characters')
    .optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  coverImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  totalEnrollments: z.number().int().min(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
  slug: z.string().optional(),
  modules: z.array(ModuleSchema).optional(),
});

// Course Status Update Schema
export const updateCourseStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
    message: 'Status must be DRAFT, PUBLISHED, or ARCHIVED',
  }),
});

// Course ID Parameter Schema
export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid courseId format'),
  }),
});

// Legacy schemas for backward compatibility
export const ContentSchema = LessonContentSchema;
export const LessonSchema = LessonContentSchema;
export const QuestionSchema = QuizQuestionSchema;
export const CourseInputSchema = createCourseSchema;
