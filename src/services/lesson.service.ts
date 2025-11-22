import type { ClientSession } from 'mongoose';
import LessonModel from '../models/Lessons.ts';
import { AppError } from '../utils/AppError.ts';
import { LessonRepository } from '../repositories/lesson.repository.ts';
import type { Lesson } from '../interfaces/index.ts';

export class LessonService {
  async createLesson(moduleId: string, data: Lesson, tenantId: string, session?: ClientSession) {
    const lesson = await LessonRepository.create(tenantId, moduleId, data, session ?? null);
    return lesson;
  }

  async getLessonById(lessonId: string, tenantId: string, session?: ClientSession) {
    const lesson = await LessonRepository.findById(lessonId, tenantId, session ?? null);
    if (!lesson) throw new AppError('Module not found', 404);
    return lesson;
  }

  async updateLesson(
    lessonId: string,
    data: Partial<Lesson>,
    tenantId: string,
    session?: ClientSession
  ) {
    const lesson = await LessonRepository.update(lessonId, data, tenantId, session ?? null);
    if (!lesson) throw new AppError('Lesson not found', 404);
    return module;
  }

  async deleteLesson(lessonId: string, tenantId: string, session?: ClientSession) {
    const lesson = await LessonModel.findOneAndDelete({ _id: lessonId, tenantId }).session(
      session ?? null
    );
    if (!lesson) throw new AppError('Lesson not found', 404);
    return lesson;
  }

  async getLessonsByModule(moduleId: string, tenantId: string, session?: ClientSession) {
    const lessons = await LessonRepository.findByModule(moduleId, tenantId, session ?? null);
    return lessons;
  }
}
