import { Schema, model, Document, Types } from 'mongoose';
import { slugify } from '../utils/slugify.ts';
import { CourseStatus } from '../interfaces/index.ts';

export interface ICourse extends Document {
  tenantId: Types.ObjectId;
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  price: number;
  status: CourseStatus;
  totalEnrollments: number;
  totalDuration: number;
  averageRating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true },
    slug: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    price: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(CourseStatus),
      required: true,
      default: CourseStatus.DRAFT,
    },
    totalEnrollments: { type: Number, default: 0 },
    totalDuration: { type: Number },
    averageRating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
courseSchema.pre('save', function (next) {
  this.slug = slugify(this.title);
  next();
});
export default model<ICourse>('Course', courseSchema);
