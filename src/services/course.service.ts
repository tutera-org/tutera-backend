import type { ClientSession } from 'mongoose';
import type { CreateCourseDTO } from '../interfaces/index.ts';
import CourseModel from '../models/Courses.ts';
import { AppError } from '../utils/AppError.ts';
import { slugify } from '../utils/slugify.ts';

export class CourseService {
  async createCourse(data: CreateCourseDTO, tenantId: string, session?: ClientSession) {
    const courseSlug = slugify(data.title);

    const exists = await CourseModel.findOne({ tenantId, slug: courseSlug }).session(
      session ?? null
    );
    if (exists) throw new AppError('Course title already exists for this tenant', 409);

    const course = new CourseModel({
      ...data,
      tenantId,
      totalEnrollment: 0,
      averageRating: 0,
      isActive: true,
    });

    await course.save({ session: session ?? null });
    return course;
  }
  async getAllCourses(tenantId: string, session?: ClientSession) {
    return CourseModel.find({ tenantId }).session(session ?? null);
  }

  async getCourseById(courseId: string, tenantId: string) {
    const course = await CourseModel.findOne({ _id: courseId, tenantId });
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async updateCourse(
    courseId: string,
    data: Partial<CreateCourseDTO>,
    tenantId: string,
    session?: ClientSession
  ) {
    const course = await CourseModel.findOneAndUpdate({ _id: courseId, tenantId }, data, {
      new: true,
    }).session(session ?? null);
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async deleteCourse(courseId: string, tenantId: string, session?: ClientSession) {
    const result = await CourseModel.findOneAndDelete({ _id: courseId, tenantId }).session(
      session ?? null
    );
    if (!result) throw new AppError('Course not found', 404);
  }
}
