import type { ClientSession } from 'mongoose';
import CourseModel from '../models/Courses.ts';
import ModuleModel from '../models/Modules.ts';
import { AppError } from '../utils/AppError.ts';
import type { Module } from '../interfaces/index.ts';
import { ModuleRepository } from '../repositories/module.repository.ts';

export class ModuleService {
  async createModule(courseId: string, data: Module, tenantId: string, session?: ClientSession) {
    const course = await CourseModel.findOne({ _id: courseId, tenantId }).session(session ?? null);
    if (!course) throw new AppError('Course not found', 404);

    const module = await ModuleModel.create(
      {
        ...data,
        courseId,
        tenantId,
      },
      { session: session ?? null }
    );

    return module;
  }

  async getModuleById(moduleId: string, tenantId: string, session?: ClientSession) {
    const module = await ModuleModel.findOne({ _id: moduleId, tenantId }).session(session ?? null);
    if (!module) throw new AppError('Module not found', 404);
    return module;
  }

  async updateModule(
    moduleId: string,
    data: Partial<Module>,
    tenantId: string,
    session?: ClientSession
  ) {
    const module = await ModuleRepository.update(moduleId, data, tenantId, session ?? null);
    if (!module) throw new AppError('Module not found', 404);
    return module;
  }

  async deleteModule(moduleId: string, tenantId: string, session?: ClientSession) {
    const result = await ModuleModel.findOneAndDelete({ _id: moduleId, tenantId }).session(
      session ?? null
    );
    if (!result) throw new AppError('Module not found', 404);
  }
}
