import { Schema, model, Document, Types } from 'mongoose';

export interface ITenant extends Document {
  id: Types.ObjectId;
  slug: string;
  name: string;
  email: string;
  organizationName: string;
  description?: string;
  customizationId: Types.ObjectId;
  isActive: boolean;
  isVerified: boolean;
  isFlagged: boolean;
  flaggedReason?: string;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      auto: true,
    },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    organizationName: { type: String, required: true },
    description: { type: String },
    customizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Customization',
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    flaggedReason: { type: String },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<ITenant>('Tenant', TenantSchema);
