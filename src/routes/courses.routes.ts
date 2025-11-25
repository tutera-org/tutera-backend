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

// // GET /:id/modules: Get all modules for a specific course
// router.get('/:id/modules', getCourseModules);

// // POST /modules: Create a new module for a specific course
// router.post('/modules', createModule);

// // GET /modules/:moduleId/lessons: Get lessons for a specific module
// router.get('/modules/:id/lessons', getModuleLessons);

// // POST /lessons: Create a new lesson for a module
// router.post('/lessons', createLesson);

export default router;
