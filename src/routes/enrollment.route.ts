import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import EnrollmentController from '../controllers/enrollment.controller.ts';

const router = Router();

router.get(
  '/',
  authenticate as unknown as RequestHandler,
  EnrollmentController.getEnrollmentCourses
);

router.post(
  '/enroll',
  authenticate as unknown as RequestHandler,
  EnrollmentController.enrollStudent
);

router.patch(
  '/complete-lesson',
  authenticate as unknown as RequestHandler,
  EnrollmentController.completeLesson
);

router.patch(
  '/rate-course',
  authenticate as unknown as RequestHandler,
  EnrollmentController.rateCourse
);

router.post(
  '/submit-quiz',
  authenticate as unknown as RequestHandler,
  EnrollmentController.submitQuizAttempt
);

router.get(
  '/:courseId/details',
  authenticate as unknown as RequestHandler,
  EnrollmentController.getEnrollmentDetails
);

export default router;
