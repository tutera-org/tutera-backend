import type { ClientSession } from 'mongoose';
import ModuleModel from '../models/Modules.ts';
import type { Module } from '../interfaces/index.ts';

export const ModuleRepository = {
  async create(
    courseId: string,
    data: Module,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return await ModuleModel.create(
      [
        {
          ...data,
          courseId,
          tenantId,
        },
      ],
      { session }
    ).then((docs) => docs[0]);
  },

  findById(moduleId: string, tenantId: string, session: ClientSession | null = null) {
    return ModuleModel.findOne({ _id: moduleId, tenantId }).session(session);
  },

  findAll(courseId: string, tenantId: string, session: ClientSession | null = null) {
    return ModuleModel.find({ courseId, tenantId }).session(session);
  },
  update(
    moduleId: string,
    data: Partial<Module>,
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
