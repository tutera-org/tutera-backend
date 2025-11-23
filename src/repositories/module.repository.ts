import type { ClientSession } from 'mongoose';
import type { ModuleDTO } from '../interfaces/dtos/course.dto.ts';
import ModuleModel, { type IModule } from '../models/Modules.ts';
import type { Module } from '../interfaces/index.ts';

export const ModuleRepository = {
  create(
    courseId: string,
    data: Module,
    tenantId: string,
    session: ClientSession | null = null
  ): Promise<IModule | unknown> {
    return ModuleModel.create(
      {
        ...data,
        courseId,
        tenantId,
      },
      { session }
    );
  },

  findById(moduleId: string, tenantId: string, session: ClientSession | null = null) {
    return ModuleModel.findOne({ _id: moduleId, tenantId }).session(session);
  },

  findAll(courseId: string, tenantId: string, session: ClientSession | null = null) {
    return ModuleModel.find({ courseId, tenantId }).session(session);
  },
  update(
    moduleId: string,
    data: Partial<ModuleDTO>,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return ModuleModel.findOneAndUpdate({ _id: moduleId, tenantId }, data, {
      new: true,
    }).session(session);
  },

  deleteOne(moduleId: string, tenantId: string, session: ClientSession | null = null) {
    return ModuleModel.deleteOne({ _id: moduleId, tenantId }).session(session);
  },

  findAndDelete(moduleId: string, tenantId: string, session: ClientSession | null = null) {
    return ModuleModel.findOneAndDelete({ _id: moduleId, tenantId }).session(session);
  },
};
