import type { ClientSession } from 'mongoose';
import StudentCourseModel from '../models/StudentCourse.ts';

export const StudentCourseRepository = {
  async enroll(studentId: string, courseId: string, tenantId: string, session?: ClientSession) {
    return StudentCourseModel.create([{ studentId, courseId, tenantId }], { session }).then(
      (docs) => docs[0]
    );
  },

  async markLessonCompleted(
    studentId: string,
    courseId: string,
    lessonId: string,
    tenantId: string
  ) {
    return StudentCourseModel.findOneAndUpdate(
      { studentId, courseId, tenantId },
      { $addToSet: { completedLessons: lessonId } }, // prevents duplicates
      { new: true }
    );
  },

  async rateCourse(studentId: string, courseId: string, tenantId: string, rating: number) {
    return StudentCourseModel.findOneAndUpdate(
      { studentId, courseId, tenantId },
      { $set: { rating } },
      { new: true }
    );
  },

  async getStudentCourses(studentId: string, tenantId: string) {
    return StudentCourseModel.find({ studentId, tenantId }).populate('courseId');
  },
};
