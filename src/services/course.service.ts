import type { ClientSession } from 'mongoose';
import type { Course, CourseStatus, Module } from '../interfaces/index.ts';
import { AppError } from '../utils/AppError.ts';
import { CourseRepository } from '../repositories/course.repository.ts';
import { ModuleRepository } from '../repositories/module.repository.ts';
import { LessonRepository } from '../repositories/lesson.repository.ts';
import type { DeepPartial } from '../utils/types.ts';
import type { CourseDTO, ModuleDTO } from '../interfaces/dtos/course.dto.ts';
import { QuizRepository } from '../repositories/quiz.repository.ts';
import { slugify } from '../utils/slugify.ts';

export class CourseService {
  // Get All Courses
  async getAllCourses(tenantId: string, session?: ClientSession) {
    return await CourseRepository.findAll(tenantId, session ?? null);
  }

  async getCourseDetails(courseId: string, tenantId: string, session?: ClientSession) {
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
        lessons: lessons.map((lesson) => lesson.toObject()),
        quiz: quiz ? quiz.toObject() : null,
      });
    }
    return { ...course, modules: cascadedModules };
  }

  // Create Full Course with Modules and Lessons
  async createFullCourse(tenantId: string, data: DeepPartial<CourseDTO>, session?: ClientSession) {
    const slug = slugify(data.title!);
    // ✅ Validate: check if course title already exists
    const existingCourse = await CourseRepository.findBySlug(slug, tenantId, session ?? null);
    if (existingCourse) {
      throw new AppError(`Course with title "${data.title}" already exists`, 400);
    }

    const course = await CourseRepository.create(data as Course, tenantId, session ?? null);

    const moduleData: Array<ModuleDTO> = [...((data?.modules ?? []) as Array<ModuleDTO>)];

    for (const module of moduleData) {
      const createdModule = (await ModuleRepository.create(
        course._id as string,
        { ...(module as Module) },
        tenantId,
        session ?? null
      )) as object & { _id: string };

      const moduleId = createdModule._id as string;
      for (const lesson of module.lessons ?? []) {
        await LessonRepository.create(tenantId, moduleId, { ...lesson }, session ?? null);
      }

      if (module.quiz) {
        await QuizRepository.create({ ...module.quiz }, tenantId, moduleId, session ?? null);
      }
    }
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

    // Deep clone data to avoid mutation issues
    const updatedData = JSON.parse(JSON.stringify(data));

    const courseData: Partial<Course> = {
      title: updatedData?.title,
      description: updatedData?.description,
      price: updatedData?.price,
      coverImage: updatedData?.coverImage,
      status: updatedData?.status,
    } as Partial<Course>;

    const moduleData: Array<ModuleDTO> = [...(updatedData?.modules ?? [])];

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
      let moduleId: string;
      if (module._id) {
        await ModuleRepository.update(module._id, module, tenantId, session ?? null);
        moduleId = module._id;
      } else {
        // Create new module
        const createdModule = await ModuleRepository.create(
          courseId,
          { ...module },
          tenantId,
          session ?? null
        );
        moduleId = createdModule?._id as string;
      }

      for (const lesson of module.lessons ?? []) {
        if (lesson._id) {
          await LessonRepository.update(lesson._id, lesson, tenantId, session ?? null);
        } else {
          // Create new lesson does not have _id
          await LessonRepository.create(tenantId, moduleId, { ...lesson }, session ?? null);
        }
      }
      if (module.quiz) {
        if (module.quiz._id) {
          await QuizRepository.update(module.quiz._id, module.quiz, tenantId, session ?? null);
        } else {
          // Create new quiz
          await QuizRepository.create(
            { ...module.quiz, moduleId: module._id! },
            tenantId,
            module._id!,
            session ?? null
          );
        }
      }
    }

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
        lessons: lessons.map((lesson) => lesson.toObject()),
        quiz: quiz ? quiz.toObject() : null,
      });
    }

    return { ...updatedCourse.toObject(), modules: cascadedModules };
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

      const quiz = await QuizRepository.findByModule(
        module._id as string,
        tenantId,
        session ?? null
      );
      if (quiz) {
        const quizId = quiz._id as string;
        await QuizRepository.deleteOne(quizId, tenantId, session ?? null);
      }

      const moduleId = module._id as string;
      await ModuleRepository.deleteOne(moduleId, tenantId, session ?? null);
    }
    await CourseRepository.deleteOne(courseId, tenantId, session ?? null);
  }

  /**
   * Update the status of a course (e.g., DRAFT → PUBLISHED)
   */
  async updateCourseStatus(
    courseId: string,
    tenantId: string,
    status: CourseStatus,
    session?: ClientSession
  ) {
    const course = await CourseRepository.findById(courseId, tenantId, session ?? null);
    if (!course) throw new AppError('Course not found', 404);

    const updatedCourse = await CourseRepository.update(
      courseId,
      { status },
      tenantId,
      session ?? null
    );

    if (!updatedCourse) throw new AppError('Failed to update course status', 500);

    return updatedCourse.toObject();
  }
}
