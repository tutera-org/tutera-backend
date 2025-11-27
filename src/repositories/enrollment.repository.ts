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
    console.log('markLessonCompleted called with:', { studentId, courseId, lessonId, tenantId });

    try {
      const result = await EnrollmentModel.findOneAndUpdate(
        { studentId, courseId, tenantId },
        {
          $addToSet: {
            completedLessons: lessonId,
          },
        },
        { new: true, session }
      );

      console.log('Database update result:', result);
      return result;
    } catch (error) {
      console.error('Error in markLessonCompleted:', error);
      throw error;
    }
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

  findOne(
    studentId: string,
    courseId: string,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return EnrollmentModel.findOne({ studentId, courseId, tenantId }).session(session);
  },

  getStudentCourses(studentId: string, tenantId: string) {
    return EnrollmentModel.find({ studentId, tenantId }).populate('courseId');
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
