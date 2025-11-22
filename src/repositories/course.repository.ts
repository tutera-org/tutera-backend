import type { ClientSession } from 'mongoose';
import type { CourseDTO } from '../interfaces/dtos/course.dto.ts';
import CourseModel from '../models/Courses.ts';

export const CourseRepository = {
  create(data: CourseDTO, tenantId: string, session: ClientSession | null = null) {
    const course = new CourseModel({
      ...data,
      tenantId,
      totalEnrollment: 0,
      averageRating: 0,
      isActive: true,
    });

    course.save({ session: session ?? null });
  },

  findAll(tenantId: string, session: ClientSession | null = null) {
    return CourseModel.find({ tenantId }).session(session);
  },

  findById(courseId: string, tenantId: string, session: ClientSession | null = null) {
    return CourseModel.findOne({ _id: courseId, tenantId }).session(session);
  },

  findBySlug(slug: string, tenantId: string, session: ClientSession | null = null) {
    return CourseModel.findOne({ tenantId, slug }).session(session);
  },

  update(
    courseId: string,
    data: Partial<CourseDTO>,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return CourseModel.findOneAndUpdate({ _id: courseId, tenantId }, data, {
      new: true,
    }).session(session);
  },

  deleteOne(courseId: string, tenantId: string, session: ClientSession | null = null) {
    return CourseModel.deleteOne({ _id: courseId, tenantId }).session(session);
  },

  findAndDelete(courseId: string, tenantId: string, session: ClientSession | null = null) {
    return CourseModel.findOneAndDelete({ _id: courseId, tenantId }).session(session);
  },
};
