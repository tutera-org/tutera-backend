import type { ClientSession } from 'mongoose';
import { EnrollmentRepository } from '../repositories/enrollment.repository.ts';
import { AppError } from '../utils/AppError.ts';
import { QuizRepository } from '../repositories/quiz.repository.ts';
import { LessonRepository } from '../repositories/lesson.repository.ts';
import { ModuleRepository } from '../repositories/module.repository.ts';
import { CourseRepository } from '../repositories/course.repository.ts';

export class EnrollmentService {
  /**
   * Get all enrolled courses for a student with progress summary
   */
  async getAllEnrolledCoursesSummary(studentId: string, tenantId: string, session?: ClientSession) {
    const enrollments = await EnrollmentRepository.getStudentCourses(studentId, tenantId);
    if (!enrollments || enrollments.length === 0) {
      throw new AppError('No enrolled courses found', 404);
    }

    const results = [];
    for (const enrollment of enrollments) {
      const course = await CourseRepository.findById(
        enrollment.courseId.toString(),
        tenantId,
        session ?? null
      );
      if (!course) continue;

      // total lessons in course
      const lessons = await LessonRepository.findByCourse(
        enrollment.courseId.toString(),
        tenantId,
        session ?? null
      );

      const totalLessons = lessons.length;
      const completedLessons = enrollment.completedLessons.length;
      const progressPercent =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      results.push({
        courseId: course._id,
        title: course.title,
        description: course.description,
        coverImage: course.coverImage,
        enrolledAt: enrollment.enrolledAt,
        rating: enrollment.rating ?? null,
        progress: {
          completedLessons,
          totalLessons,
          percent: progressPercent,
          quizAttempts: enrollment.quizAttempts.map((qa) => ({
            quizId: qa.quizId,
            score: qa.score,
            attemptedAt: qa.attemptedAt,
          })),
        },
      });
    }

    return results;
  }

  async enrollStudent(
    studentId: string,
    courseId: string,
    tenantId: string,
    session?: ClientSession
  ) {
    const existing = await EnrollmentRepository.findOne(studentId, courseId, tenantId);
    if (existing) throw new AppError('Already enrolled in this course', 400);
    return await EnrollmentRepository.enroll(studentId, courseId, tenantId, session ?? null);
  }
  async completeLesson(studentId: string, courseId: string, lessonId: string, tenantId: string) {
    return EnrollmentRepository.markLessonCompleted(studentId, courseId, tenantId, lessonId);
  }

  async rateCourse(studentId: string, courseId: string, tenantId: string, rating: number) {
    if (rating < 1 || rating > 5) throw new AppError('Rating must be between 1 and 5', 400);
    return EnrollmentRepository.rateCourse(studentId, courseId, tenantId, rating, null);
  }

  async submitQuizAttempt(
    studentId: string,
    courseId: string,
    quizId: string,
    tenantId: string,
    answers: { questionIndex: number; selectedOptionIndex: number }[]
  ) {
    const quiz = await QuizRepository.findById(quizId, tenantId);
    if (!quiz) throw new AppError('Quiz not found', 404);

    let correctCount = 0;
    const evaluatedAnswers = answers.map((ans) => {
      const question = quiz.questions[ans.questionIndex];
      const isCorrect = question?.correctAnswerIndex === ans.selectedOptionIndex;
      if (isCorrect) correctCount++;
      return { ...ans, isCorrect };
    });
    const score = Math.round((correctCount / quiz.questions.length) * 100);

    return EnrollmentRepository.addQuizAttempt(studentId, courseId, tenantId, {
      quizId,
      score,
      attemptedAt: new Date(),
      answers: evaluatedAnswers,
    });
  }

  async getDetails(studentId: string, courseId: string, tenantId: string, session?: ClientSession) {
    const enrollment = await EnrollmentRepository.findOne(studentId, courseId, tenantId);
    if (!enrollment) throw new AppError('Not enrolled in this course', 403);

    const course = await CourseRepository.findById(courseId, tenantId, session ?? null);
    if (!course) throw new AppError('Course not found', 404);

    const modules = await ModuleRepository.findAll(courseId, tenantId, session ?? null);
    const cascadedModules = [];

    for (const module of modules) {
      const lessons = await LessonRepository.findByModule(
        module._id as string,
        tenantId,
        session ?? null
      );
      const quiz = await QuizRepository.findByModule(
        module._id as string,
        tenantId,
        session ?? null
      );

      cascadedModules.push({
        ...module.toObject(),
        lessons: lessons.map((lesson) => ({
          ...lesson.toObject(),
          isCompleted: enrollment.completedLessons.some(
            (id) => id.toString() === (lesson._id?.toString() as string)
          ),
        })),
        quiz: quiz
          ? {
              ...quiz.toObject(),
              attempt:
                enrollment.quizAttempts.find(
                  (qa) => qa.quizId.toString() === (quiz._id?.toString() as string)
                ) || null,
            }
          : null,
      });
    }

    return {
      ...course.toObject(),
      rating: enrollment.rating ?? null,
      enrolledAt: enrollment.enrolledAt,
      modules: cascadedModules,
    };
  }
}
