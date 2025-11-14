import express from 'express';
import {
  getCourses,
  createCourse,
  getCourseModules,
  createModule,
  getModuleLessons,
  createLesson,
} from '../controllers/courses.controller.ts';

const router = express.Router();

// Get all courses for the current tenant
router.get('/', getCourses);

// POST /: Create a new course for current tenant
router.post('/', createCourse);

// GET /:id/modules: Get all modules for a specific course
router.get('/:id/modules', getCourseModules);

// POST /modules: Create a new module for a specific course
router.post('/modules', createModule);

// GET /modules/:moduleId/lessons: Get lessons for a specific module
router.get('/modules/:id/lessons', getModuleLessons);

// POST /lessons: Create a new lesson for a module
router.post('/lessons', createLesson);

export default router;
