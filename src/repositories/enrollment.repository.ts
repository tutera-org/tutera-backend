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
    try {
      // Use workaround - get all enrollments, find the one, update it manually
      const allEnrollments = await EnrollmentModel.find({});
      const enrollment = allEnrollments.find(
        (e) => e.studentId === studentId && e.courseId === courseId && e.tenantId === tenantId
      );

      if (!enrollment) return null;

      // Check if lesson is already completed
      if (enrollment.completedLessons.includes(lessonId)) return enrollment;

      // Add lesson to completedLessons
      enrollment.completedLessons.push(lessonId);

      // Save the updated enrollment
      const result = await enrollment.save({ session });
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

  findOne(studentId: string, courseId: string, tenantId: string) {
    // Use workaround - get all enrollments then filter with JavaScript
    return EnrollmentModel.find({}).then((allEnrollments) => {
      const found = allEnrollments.find(
        (e) => e.studentId === studentId && e.courseId === courseId && e.tenantId === tenantId
      );
      return found;
    });
  },

  getStudentCourses(studentId: string, tenantId: string) {
    return EnrollmentModel.find({ studentId, tenantId }).populate('courseId');
  },

  getEnrollmentsByCourse(courseId: string, tenantId: string) {
    console.log('Getting enrollments for course:', courseId, 'tenant:', tenantId);
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
