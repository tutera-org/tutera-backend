import { type NextFunction, type Request, type Response } from 'express';
import Module from '../models/Modules.ts';
import Lessons from '../models/Lessons.ts';
import Course from '../models/Courses.ts';
import type { AuthRequest } from '../interfaces/index.ts';
import { startSession } from 'mongoose';
import { CourseService } from '../services/course.service.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';

export class CoursesController {
  private readonly courseService = new CourseService();

  // TODO: complete the updateCourse controller
  // async updateCourse(req: AuthRequest, res: Response, next: NextFunction) {
  //   const session = await startSession();
  //   try {

  //   }
  // }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      const { courseId } = req.body;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required.' });
      }

      await session.withTransaction(async () => {
        await this.courseService.deleteCourseWithProperties(courseId, tenantId, session);
      });

      ApiResponse.successNoData(res, 'Course deleted successfully.');
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      next(error);
    } finally {
      session.endSession();
    }
  }
}

// Get all courses for the current tenant
export const getCourses = async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const courses = await Course.find({ tenantId }).select('-__v');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// POST /: Create a new course for current tenant
export const createCourse = async (req: Request, res: Response) => {
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
};

// GET /:id/modules: Get all modules for a specific course
export const getCourseModules = async (req: Request, res: Response) => {
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
};

// POST /modules: Create a new module for a specific course
export const createModule = async (req: Request, res: Response) => {
  try {
    const tenantId = req.body.tenantId;
    const { courseId, title, order } = req.body;

    // Verify course belongs to tenant
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
};

// GET /modules/:moduleId/lessons: Get lessons for a specific module
export const getModuleLessons = async (req: Request, res: Response) => {
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
};

// POST /lessons: Create a new lesson for a module
export const createLesson = async (req: Request, res: Response) => {
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
};

export default {
  getCourses,
  createCourse,
  getCourseModules,
  createModule,
  getModuleLessons,
  createLesson,
};
