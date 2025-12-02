import { Schema, model, Document, Types } from 'mongoose';

export interface ILesson extends Document {
  tenantId: Types.ObjectId;
  moduleId: Types.ObjectId;
  title: string;
  description?: string;
  type: 'VIDEO' | 'PDF' | 'AUDIO';
  order: number;
  contentId?: Types.ObjectId;
  duration?: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true },
    moduleId: { type: Schema.Types.ObjectId, required: true, ref: 'Module' },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['VIDEO', 'PDF', 'AUDIO'],
      required: true,
    },
    order: { type: Number, required: true },
    contentId: { type: Schema.Types.ObjectId, ref: 'Media' },
    duration: { type: Number },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lessonSchema.index({ tenantId: 1, moduleId: 1, order: 1 });

export default model<ILesson>('Lesson', lessonSchema);
