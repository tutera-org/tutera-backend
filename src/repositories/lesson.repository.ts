import type { ClientSession } from 'mongoose';
import type { LessonDTO } from '../interfaces/dtos/course.dto.ts';
import LessonModel from '../models/Lessons.ts';

export const LessonRepository = {
  create(
    tenantId: string,
    moduleId: string,
    data: LessonDTO,
    session: ClientSession | null = null
  ) {
    return LessonModel.create(
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
      { session }
    );
  },

  findById(lessonId: string, tenantId: string, session: ClientSession | null = null) {
    return LessonModel.findOne({ _id: lessonId, tenantId }).populate('contentId').session(session);
  },
  findByModule(moduleId: string, tenantId: string, session: ClientSession | null = null) {
    return LessonModel.find({ moduleId, tenantId })
      .sort({ order: 1 })
      .populate('contentId')
      .session(session ?? null);
  },

  update(
    lessonId: string,
    data: Partial<LessonDTO>,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return LessonModel.findOneAndUpdate({ _id: lessonId, tenantId }, data, {
      new: true,
    }).session(session);
  },
  deleteOne(lessonId: string, tenantId: string, session: ClientSession | null = null) {
    return LessonModel.deleteOne({ _id: lessonId, tenantId }).session(session);
  },

  findAndDelete(lessonId: string, tenantId: string, session: ClientSession | null = null) {
    return LessonModel.findOneAndDelete({ _id: lessonId, tenantId }).session(session);
  },
};
