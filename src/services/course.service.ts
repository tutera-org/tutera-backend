import type { ClientSession } from 'mongoose';
import type { Course } from '../interfaces/index.ts';
import CourseModel from '../models/Courses.ts';
import { AppError } from '../utils/AppError.ts';
import { slugify } from '../utils/slugify.ts';
import { CourseRepository } from '../repositories/course.repository.ts';
import { ModuleRepository } from '../repositories/module.repositoty.ts';
import { LessonRepository } from '../repositories/lesson.repository.ts';
import type { DeepPartial } from '../utils/types.ts';
import type { CourseDTO, LessonDTO, ModuleDTO } from '../interfaces/dtos/course.dto.ts';

export class CourseService {
  async createCourse(data: Course, tenantId: string, session?: ClientSession) {
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

  async getCourseById(courseId: string, tenantId: string, session?: ClientSession) {
    const course = await CourseModel.findOne({ _id: courseId, tenantId }).session(session ?? null);
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async updateCourse(
    courseId: string,
    data: Partial<Course>,
    tenantId: string,
    session?: ClientSession
  ) {
    const course = await CourseModel.findOneAndUpdate({ _id: courseId, tenantId }, data, {
      new: true,
    }).session(session ?? null);
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }

  async updateAllCourseProperties(
    courseId: string,
    tenantId: string,
    data: DeepPartial<CourseDTO>,
    session?: ClientSession
  ) {
    const course = await CourseRepository.findById(courseId, tenantId, session ?? null);
    if (!course) throw new AppError('Course not found', 404);
    const updatedData: Partial<CourseDTO> = JSON.parse(JSON.stringify(data));

    const courseData: Partial<Course> = {
      title: updatedData?.title,
      description: updatedData?.description,
      price: updatedData?.price,
      coverImage: updatedData?.coverImage,
      status: updatedData?.status,
    } as Partial<Course>;

    const moduleData: Array<ModuleDTO> = [...(updatedData?.modules ?? [])];

    const lessonsData: Array<LessonDTO> = moduleData?.flatMap((module) => [
      ...(module.lessons ?? []),
    ]);

    // --- Update Course Document ---

    const updatedCourse = await CourseRepository.update(
      courseId,
      courseData,
      tenantId,
      session ?? null
    );
    if (!updatedCourse) throw new AppError('Course not found', 404);

    // --- Update Modules and Lessons ---

    for (const module of moduleData) {
      if (module._id) {
        await ModuleRepository.update(module._id, module, tenantId, session ?? null);
      }
    }

    for (const lesson of lessonsData) {
      if (lesson._id) {
        await LessonRepository.update(lesson._id, lesson, tenantId, session ?? null);
      }
    }

    return updatedCourse;
  }

  async deleteCourseWithProperties(courseId: string, tenantId: string, session?: ClientSession) {
    const course = await CourseRepository.findById(courseId, tenantId, session ?? null);
    if (!course) throw new AppError('Course not found', 404);

    const modules = await ModuleRepository.findAll(courseId, tenantId, session ?? null);
    for (const module of modules) {
      const lessons = await LessonRepository.findByModule(module.id, tenantId, session ?? null);
      for (const lesson of lessons) {
        const lessonId = lesson._id as string;
        await LessonRepository.deleteOne(lessonId, tenantId, session ?? null);
      }

      const moduleId = module._id as string;
      await ModuleRepository.deleteOne(moduleId, tenantId, session ?? null);
    }
    await CourseRepository.deleteOne(courseId, tenantId, session ?? null);
  }
}
