import { model, Schema } from 'mongoose';
import type { IQuiz } from '../interfaces/index.ts';

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: { type: String },
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    tenantId: { type: String, required: true },
    createdBy: { type: String, required: true },

    questions: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true, validate: (v: string[]) => v.length === 4 },
        correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },
        explanation: { type: String },
      },
    ],

    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<IQuiz>('Quiz', QuizSchema);
