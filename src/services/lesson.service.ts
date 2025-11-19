import type { ClientSession } from 'mongoose';
import LessonModel from '../models/Lessons.ts';
import type { LessonDTO } from '../interfaces/index.ts';
import { AppError } from '../utils/AppError.ts';

export class LessonService {
  async createLesson(moduleId: string, data: LessonDTO, tenantId: string, session?: ClientSession) {
    const lesson = await LessonModel.create(
      {
        tenantId,
        moduleId,
        contentId: data.contentId,
        title: data.title,
        description: data.description,
        type: data.type,
        order: data.order,
        duration: data.duration,
        isPreview: data.isPreview ?? false,
      },
      { session: session ?? null }
    );

    return lesson;
  }

  async getLessonById(lessonId: string, tenantId: string, session?: ClientSession) {
    const lesson = await LessonModel.findOne({ _id: lessonId, tenantId }).session(session ?? null);
    if (!module) throw new AppError('Module not found', 404);
    return lesson;
  }

  async updateLesson(
    lessonId: string,
    data: Partial<LessonDTO>,
    tenantId: string,
    session?: ClientSession
  ) {
    const lesson = await LessonModel.findOneAndUpdate({ _id: lessonId, tenantId }, data, {
      new: true,
    }).session(session ?? null);
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
    const lessons = await LessonModel.find({ moduleId, tenantId })
      .sort({ order: 1 })
      .populate('contentId')
      .session(session ?? null);
    return lessons;
  }
}
