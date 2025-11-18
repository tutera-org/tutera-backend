import type { ModuleDTO } from '../interfaces/index.ts';
import CourseModel from '../models/Course.ts';
import ModuleModel from '../models/Modules.ts';
import { AppError } from '../utils/AppError.ts';

export class ModuleService {
  async createModule(courseId: string, data: ModuleDTO, tenantId: string) {
    const course = await CourseModel.findOne({ _id: courseId, tenantId });
    if (!course) throw new AppError('Course not found', 404);

    const module = await ModuleModel.create({
      ...data,
      courseId,
      tenantId,
    });

    return module;
  }

  async getModuleById(moduleId: string, tenantId: string) {
    const module = await ModuleModel.findOne({ _id: moduleId, tenantId });
    if (!module) throw new AppError('Module not found', 404);
    return module;
  }

  async updateModule(moduleId: string, data: Partial<ModuleDTO>, tenantId: string) {
    const module = await ModuleModel.findOneAndUpdate({ _id: moduleId, tenantId }, data, {
      new: true,
    });
    if (!module) throw new AppError('Module not found', 404);
    return module;
  }

  async deleteModule(moduleId: string, tenantId: string) {
    const result = await ModuleModel.findOneAndDelete({ _id: moduleId, tenantId });
    if (!result) throw new AppError('Module not found', 404);
  }
}
