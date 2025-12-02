import type { ClientSession } from 'mongoose';
import EnrollmentModel from '../models/Enrollments.ts';

export const EnrollmentRepository = {
  async enroll(
    studentId: string,
    courseId: string,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return await EnrollmentModel.create([{ studentId, courseId, tenantId }], { session }).then(
      (docs) => docs[0]
    );
  },

  async markLessonCompleted(
    studentId: string,
    courseId: string,
    lessonId: string,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return EnrollmentModel.findOneAndUpdate(
      { studentId, courseId, tenantId },
      { $addToSet: { completedLessons: lessonId } },
      { new: true, session }
    );
  },

  rateCourse(
    studentId: string,
    courseId: string,
    tenantId: string,
    rating: number,
    session: ClientSession | null = null
  ) {
    return EnrollmentModel.findOneAndUpdate(
      { studentId, courseId, tenantId },
      { $set: { rating } },
      { new: true, session }
    );
  },

  findOne(studentId: string, courseId: string, tenantId: string) {
    return EnrollmentModel.findOne({ studentId, courseId, tenantId });
  },

  getStudentCourses(studentId: string, tenantId: string) {
    return EnrollmentModel.find({ studentId, tenantId }).populate('courseId');
  },

  getEnrollmentsByCourse(courseId: string, tenantId: string) {
    // Use the same approach as the working creator dashboard
    return EnrollmentModel.find({ tenantId, courseId: courseId });
  },

  addQuizAttempt(
    studentId: string,
    courseId: string,
    tenantId: string,
    attempt: {
      quizId: string;
      score: number;
      attemptedAt: Date;
      answers: {
        questionIndex: number;
        selectedOptionIndex: number;
        isCorrect: boolean;
      }[];
    },
    session: ClientSession | null = null
  ) {
    return EnrollmentModel.findOneAndUpdate(
      { studentId, courseId, tenantId },
      { $push: { quizAttempts: attempt } },
      { new: true, session }
    );
  },
};
