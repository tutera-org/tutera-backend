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
  quiz?: QuizDTO;
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

export interface QuizDTO {
  _id: string;
  tenantId: string;
  moduleId: string;
  isPublished?: boolean;
  questions?: QuestionDTO[];
}

export interface QuestionDTO {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}
