import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { RequestValidator, ParamsValidator } from '../middlewares/validators.middleware.ts';
import {
  createCourseSchema,
  updateCourseSchema,
  // patchCourseSchema,
  updateCourseStatusSchema,
  courseIdParamSchema,
} from '../validations/course.validator.ts';
import courseController from '../controllers/courses.controller.ts';

const router = Router();

// Get all courses for the current tenant
router.get('/', authenticate as unknown as RequestHandler, courseController.getAllCourses);

// get Course by ID with details
router.get(
  '/:courseId/details',
  authenticate as unknown as RequestHandler,
  ParamsValidator(courseIdParamSchema),
  courseController.getCourseDetails
);
// POST /: Create a new course for current tenant
router.post(
  '/',
  authenticate as unknown as RequestHandler,
  RequestValidator(createCourseSchema),
  courseController.createCourse
);

router.patch(
  '/:courseId/publish',
  authenticate as unknown as RequestHandler,
  ParamsValidator(courseIdParamSchema),
  RequestValidator(updateCourseStatusSchema),
  courseController.updateAllCourseProperties
);

router.put(
  '/:courseId',
  authenticate as unknown as RequestHandler,
  ParamsValidator(courseIdParamSchema),
  RequestValidator(updateCourseSchema),
  courseController.updateAllCourseProperties
);
router.delete(
  '/:courseId',
  authenticate as unknown as RequestHandler,
  ParamsValidator(courseIdParamSchema),
  courseController.deleteCourse
);

router.get(
  '/analytics',
  authenticate as unknown as RequestHandler,
  courseController.getCourseAnalytics
);

// GET /debug-enrollments - Debug endpoint to check enrollments
router.get(
  '/debug-enrollments',
  authenticate as unknown as RequestHandler,
  courseController.debugEnrollments
);

export default router;
