import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import courseController from '../controllers/courses.controller.ts';

const router = Router();

// Get all courses for the current tenant
router.get('/', authenticate as unknown as RequestHandler, courseController.getAllCourses);

// get Course by ID with details
router.get(
  '/:courseId/details',
  authenticate as unknown as RequestHandler,
  courseController.getCourseDetails
);
// POST /: Create a new course for current tenant
router.post('/', authenticate as unknown as RequestHandler, courseController.createCourse);

router.patch(
  '/:courseId/publish',
  authenticate as unknown as RequestHandler,
  courseController.updateAllCourseProperties
);

router.put(
  '/:courseId',
  authenticate as unknown as RequestHandler,
  courseController.updateAllCourseProperties
);
router.delete(
  '/:courseId',
  authenticate as unknown as RequestHandler,
  courseController.deleteCourse
);

export default router;
