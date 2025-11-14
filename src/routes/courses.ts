import express, { type Request, type Response } from 'express';
import Course from '../models/course.ts';
import Module from '../models/modules.ts';
import Lessons from '../models/lessons.ts';

const router = express.Router();

// Get all courses for the current tenant
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const courses = await Course.find({ tenantId }).select('-__v');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// POST /: Create a new course for current tenant
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const { title, slug, description, level, price } = req.body;

    const course = await Course.create({
      tenantId,
      title,
      slug,
      description,
      level,
      price,
    });

    res.status(201).json(course);
  } catch (error) {
    if (error === 11000) {
      res.status(400).json({ message: 'Course with this slug already exists.' });
    } else {
      res.status(400).json({ message: error });
    }
  }
});

// GET /:id/modules: Get all modules for a specific course
router.get('/:id/modules', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const courseId = req.params.id;

    // Verify course belongs to tenant
    const course = await Course.findOne({ _id: courseId, tenantId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const modules = await Module.find({ tenantId, courseId }).select('-__v').sort({ order: 1 });

    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// POST /modules: Create a new module for a specific course
router.post('/modules', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const { courseId, title, order } = req.body;

    // Verify course belong to tenant
    const course = await Course.findOne({ _id: courseId, tenantId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const module = await Module.create({
      tenantId,
      courseId,
      title,
      order: order || 0,
    });

    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// GET /modules/:moduleId/lessons: Get lessons for a specific module
router.get('modules/:id/lessons', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const moduleId = req.params.id;

    // Verify module belongs to tenant
    const module = await Module.findOne({ _id: moduleId, tenantId });
    if (!module) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    const lessons = await Lessons.find({ tenantId, moduleId }).select('-__v').sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// POST /lessons: Create a new lesson for a module
router.post('/lessons', async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const { moduleId, title, type, order } = req.body;

    // Verify module belongs to tenant
    const module = await Module.findOne({ _id: moduleId, tenantId });
    if (!module) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    const lesson = await Lessons.create({
      tenantId,
      moduleId,
      title,
      type: type || 'VIDEO',
      order: order || 0,
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

export default router;
