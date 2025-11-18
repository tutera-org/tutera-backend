import { Schema, model, Document, Types } from 'mongoose';

export interface IModule extends Document {
  id: Types.ObjectId;
  tenantId: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  order: number;
  quizId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      auto: true,
    },
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    quizId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: 'Quiz',
    },
  },
  { timestamps: true }
);

ModuleSchema.index({ tenantId: 1, courseId: 1, order: 1 }, { unique: true });

export default model<IModule>('Module', ModuleSchema);
