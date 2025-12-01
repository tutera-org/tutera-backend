import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { RequestValidator, ParamsValidator } from '../middlewares/validators.middleware.ts';
import {
  completeLessonSchema,
  enrollStudentSchema,
  rateCourseSchema,
  submitQuizAttemptSchema,
} from '../validations/enrollment.validator.ts';
import { courseIdParamSchema } from '../validations/course.validator.ts';
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
  RequestValidator(enrollStudentSchema),
  enrollmentController.enrollStudent
);

router.patch(
  '/complete-lesson',
  authenticate as unknown as RequestHandler,
  RequestValidator(completeLessonSchema),
  enrollmentController.completeStudentLesson
);

router.patch(
  '/rate-course',
  authenticate as unknown as RequestHandler,
  RequestValidator(rateCourseSchema),
  enrollmentController.rateCourse
);

router.post(
  '/submit-quiz',
  authenticate as unknown as RequestHandler,
  RequestValidator(submitQuizAttemptSchema),
  enrollmentController.submitQuizAttempt
);

router.get(
  '/:courseId/details',
  authenticate as unknown as RequestHandler,
  ParamsValidator(courseIdParamSchema),
  enrollmentController.getEnrollmentDetails
);

export default router;
