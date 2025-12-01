import type { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse.ts';
import { CourseService } from '../services/course.service.ts';
import { startSession } from 'mongoose';
import type { Request } from 'express';

class CourseController {
  private readonly courseService = new CourseService();

  constructor() {
    this.getAllCourses = this.getAllCourses.bind(this);
    this.createCourse = this.createCourse.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
    this.getCourseDetails = this.getCourseDetails.bind(this);
    this.updateAllCourseProperties = this.updateAllCourseProperties.bind(this);
    this.updateCourseStatus = this.updateCourseStatus.bind(this);
    this.getCourseAnalytics = this.getCourseAnalytics.bind(this);
    this.debugEnrollments = this.debugEnrollments.bind(this);
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
        if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
        const courseDetails = await this.courseService.getCourseDetails(courseId!, tenantId);
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

  async updateCourseStatus(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      const { courseId } = req.params;
      const tenantId = req.user?.tenantId;
      const { status } = req.body;

      if (!tenantId) {
        return res.status(400).json({ message: 'Tenant ID is required.' });
      }

      const updatedCourse = await session.withTransaction(async () => {
        return await this.courseService.updateCourseStatus(courseId!, tenantId, status, session);
      });

      ApiResponse.success(res, updatedCourse, 'Course status updated successfully.');
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

  async getCourseAnalytics(req: Request, res: Response, next: NextFunction) {
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        const tenantId = req.user?.tenantId;
        if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });

        const analytics = await this.courseService.getCourseAnalytics(tenantId);
        ApiResponse.success(res, analytics, 'Course analytics retrieved successfully.');
      });
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      next(error);
    } finally {
      session.endSession();
    }
  }

  async debugEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });

      const EnrollmentModel = await import('../models/Enrollments.ts').then((m) => m.default);

      const allEnrollmentsNoFilter = await EnrollmentModel.find({});

      const workingEnrollments = allEnrollmentsNoFilter.filter((e) => e.tenantId === tenantId);

      const { User } = await import('../models/User.ts');
      const CourseModel = await import('../models/Courses.ts');

      const populatedEnrollments = [];
      for (const enrollment of workingEnrollments) {
        const student = await User.findById(enrollment.studentId).select('firstName lastName');
        const course = await CourseModel.default.findById(enrollment.courseId).select('title');

        populatedEnrollments.push({
          ...enrollment.toObject(),
          studentId: student,
          courseId: course,
        });
      }

      res.json({
        tenantId,
        totalEnrollments: populatedEnrollments.length,
        enrollments: populatedEnrollments.map((e) => ({
          enrollmentId: e._id,
          courseId: e.courseId,
          courseTitle: (e.courseId as { title?: string })?.title || 'Unknown Course',
          studentId: e.studentId,
          studentName: (e.studentId as { firstName?: string; lastName?: string })
            ? `${(e.studentId as { firstName: string; lastName: string }).firstName}
               ${(e.studentId as { firstName: string; lastName: string }).lastName}`
            : 'Unknown Student',
          enrolledAt: e.enrolledAt,
          completedLessons: e.completedLessons?.length || 0,
          quizAttempts: e.quizAttempts?.length || 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}
export default new CourseController();
