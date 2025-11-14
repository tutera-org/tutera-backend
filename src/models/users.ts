import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  id: Types.ObjectId;
  tenantId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'ORGANIZITION' | 'CREATOR' | 'SUPER_ADMIN';
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    id: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      auto: true,
    },
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['STUDENT', 'ORGANIZITION', 'CREATOR', 'SUPER_ADMIN'],
      required: true,
    },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default model<IUser>('User', UserSchema);
