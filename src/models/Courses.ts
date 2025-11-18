import { Schema, model, Document, Types } from 'mongoose';
import { slugify } from '../utils/slugify.ts';

export interface ICourse extends Document {
  id: Types.ObjectId;
  tenantId: Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  tumbnail?: string;
  price: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalEnrollments: number;
  averageRating: number;
  isActive: boolean;
  syllabusId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      auto: true,
    },
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    tumbnail: { type: String },
    price: { type: Number, required: true, default: 0 },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      required: true,
    },
    duration: { type: Number },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      required: true,
      default: 'DRAFT',
    },
    totalEnrollments: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    syllabusId: { type: Schema.Types.ObjectId, ref: 'Syllabus' },
  },
  { timestamps: true }
);

courseSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
courseSchema.pre('save', function (next) {
  this.slug = slugify(this.title);
  next();
});
export default model<ICourse>('Course', courseSchema);
