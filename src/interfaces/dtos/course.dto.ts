import type { CourseStatus, LessonType } from '../index.ts';

export interface CourseDTO {
  tenantId: string;
  title: string;
  description?: string;
  price?: number;
  coverImage?: string;
  status?: CourseStatus;
  modules: ModuleDTO[];
}

export interface ModuleDTO {
  _id?: string;
  title: string;
  order: number;
  quizId?: string;
  lessons: LessonDTO[];
}

export interface LessonDTO {
  _id?: string;
  title: string;
  description?: string;
  type: LessonType;
  order: number;
  duration?: number;
  isPreview?: boolean;
  contentId: string;
}
