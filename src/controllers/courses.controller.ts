import type { NextFunction, Response, Request } from 'express';
import { startSession } from 'mongoose';
import { CourseService } from '../services/course.service.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
class CourseController {
  private readonly courseService = new CourseService();

  constructor() {
    this.getAllCourses = this.getAllCourses.bind(this);
    this.createCourse = this.createCourse.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
    this.getCourseDetails = this.getCourseDetails.bind(this);
    this.updateAllCourseProperties = this.updateAllCourseProperties.bind(this);
  }

  async getAllCourses(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
        const courses = await this.courseService.getAllCourses(tenantId);
        ApiResponse.success(res, courses, 'Courses retrieved successfully.');
      });
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      next(error);
    } finally {
      session.endSession();
    }
  }

  async getCourseDetails(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        const tenantId = req.user?.tenantId;
        const { courseId } = req.params;
        console.log('Tenant ID in getCourseDetails:', tenantId);
        if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
        if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
        const courseDetails = await this.courseService.getCourseDetails(courseId, tenantId);
        ApiResponse.success(res, courseDetails, 'Course details retrieved successfully.');
      });
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      next(error);
    } finally {
      session.endSession();
    }
  }

  async createCourse(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required.' });
      }

      const courseData = req.body;

      let createdCourse;
      await session.withTransaction(async () => {
        createdCourse = await this.courseService.createFullCourse(tenantId, courseData, session);
      });

      ApiResponse.success(res, createdCourse, 'Course created successfully.');
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      next(error);
    } finally {
      session.endSession();
    }
  }

  async updateAllCourseProperties(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      const { courseId } = req.params;
      const tenantId = req.user?.tenantId;
      const courseData = req.body;

      if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required.' });
      }

      const updatedCourse = await session.withTransaction(async () => {
        return await this.courseService.updateAllCourseProperties(
          courseId!,
          tenantId,
          courseData,
          session
        );
      });

      console.log('Updated Course:', updatedCourse);
      ApiResponse.success(res, updatedCourse, 'Course updated successfully.');
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      next(error);
    } finally {
      session.endSession();
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      const { courseId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required.' });
      }

      await session.withTransaction(async () => {
        await this.courseService.deleteCourseWithProperties(courseId!, tenantId, session);
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
export default new CourseController();
