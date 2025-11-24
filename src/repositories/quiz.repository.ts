import type { ClientSession } from 'mongoose';
import QuizModel from '../models/Quiz.ts';
import type { Quiz } from '../interfaces/index.ts';

export const QuizRepository = {
  // Create a new quiz
  async create(
    data: Partial<Quiz>,
    tenantId: string,
    moduleId: string,
    session: ClientSession | null = null
  ) {
    return await QuizModel.create([{ ...data, tenantId, moduleId }], {
      session,
    }).then((docs) => docs[0]);
  },
  // Find quiz by ID
  findById(quizId: string, tenantId: string, session: ClientSession | null = null) {
    return QuizModel.findOne({ _id: quizId, tenantId }).session(session);
  },

  // Find quiz by Module ID
  findByModule(moduleId: string, tenantId: string, session: ClientSession | null = null) {
    return QuizModel.findOne({ moduleId, tenantId }).session(session);
  },
  // Find all quizzes for a tenant
  findAll(tenantId: string, session: ClientSession | null = null) {
    return QuizModel.find({ tenantId }).session(session);
  },
  // Update quiz
  update(
    quizId: string,
    data: Partial<Quiz>,
    tenantId: string,
    session: ClientSession | null = null
  ) {
    return QuizModel.findOneAndUpdate(
      { _id: quizId, tenantId },
      { $set: data },
      { new: true, session }
    );
  },

  // Delete quiz
  deleteOne(quizId: string, tenantId: string, session: ClientSession | null = null) {
    return QuizModel.deleteOne({ _id: quizId, tenantId }).session(session);
  },
};
