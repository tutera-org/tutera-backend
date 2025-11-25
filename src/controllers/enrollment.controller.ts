import type { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollmment.service.ts';

class EnrollmentController {
  private readonly enrollmentService = new EnrollmentService();
  constructor() {
    this.enrollStudent = this.enrollStudent.bind(this);
    this.completeLesson = this.completeLesson.bind(this);
    this.rateCourse = this.rateCourse.bind(this);
    this.submitQuizAttempt = this.submitQuizAttempt.bind(this);
    this.getEnrollmentDetails = this.getEnrollmentDetails.bind(this);
  }

  async enrollStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const studentId = req.user?.userId as string;
      const { courseId } = req.body;
      if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
      if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
      const enrollment = await this.enrollmentService.enrollStudent(studentId, courseId, tenantId);
      res.status(201).json({ message: 'Enrolled successfully', data: enrollment });
    } catch (error) {
      next(error);
    }
  }

  async completeLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const studentId = req.user?.userId as string;
      const { courseId, lessonId } = req.body;
      if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
      if (!lessonId) return res.status(400).json({ message: 'Lesson ID is required.' });
      if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
      await this.enrollmentService.completeLesson(studentId, courseId, lessonId, tenantId);
      res.status(200).json({ message: 'Lesson marked as completed.' });
    } catch (error) {
      next(error);
    }
  }

  async rateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const studentId = req.user?.userId as string;
      const { courseId, rating } = req.body;
      if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
      if (rating === undefined) return res.status(400).json({ message: 'Rating is required.' });
      if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
      await this.enrollmentService.rateCourse(studentId, courseId, tenantId, rating);
      res.status(200).json({ message: 'Course rated successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async submitQuizAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const studentId = req.user?.userId as string;
      const { courseId, quizId, answers } = req.body;
      if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
      if (!quizId) return res.status(400).json({ message: 'Quiz ID is required.' });
      if (!answers) return res.status(400).json({ message: 'Answers are required.' });
      if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
      const attempt = await this.enrollmentService.submitQuizAttempt(
        studentId,
        courseId,
        quizId,
        tenantId,
        answers
      );
      res.status(200).json({ message: 'Quiz attempt submitted successfully.', data: attempt });
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const studentId = req.user?.userId as string;
      const { courseId } = req.params;
      if (!courseId) return res.status(400).json({ message: 'Course ID is required.' });
      if (!tenantId) return res.status(400).json({ message: 'Tenant ID is required.' });
      const details = await this.enrollmentService.getDetails(studentId, courseId, tenantId);
      res.status(200).json({ message: 'Enrollment details fetched successfully.', data: details });
    } catch (error) {
      next(error);
    }
  }
}
export default new EnrollmentController();
