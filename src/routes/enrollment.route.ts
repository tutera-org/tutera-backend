import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import EnrollmentController from '../controllers/enrollment.controller.ts';

const enrollmentController = new EnrollmentController();

const router = Router();

router.get(
  '/',
  authenticate as unknown as RequestHandler,
  enrollmentController.getEnrollmentCourses
);

router.post(
  '/enroll',
  authenticate as unknown as RequestHandler,
  enrollmentController.enrollStudent
);

router.patch(
  '/complete-lesson',
  authenticate as unknown as RequestHandler,
  enrollmentController.completeStudentLesson
);

router.patch(
  '/rate-course',
  authenticate as unknown as RequestHandler,
  enrollmentController.rateCourse
);

router.post(
  '/submit-quiz',
  authenticate as unknown as RequestHandler,
  enrollmentController.submitQuizAttempt
);

router.get(
  '/:courseId/details',
  authenticate as unknown as RequestHandler,
  enrollmentController.getEnrollmentDetails
);

export default router;
