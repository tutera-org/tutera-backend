import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { type IUser, UserRole, type IUserModel } from '../interfaces/index.ts';
import { BCRYPT_ROUNDS } from '../config/constants.ts';

export interface UserDoc extends Document {
  _id: Types.ObjectId;
  tenantId?: Types.ObjectId;
  tenantName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  fullName: string; // virtual
  role: UserRole;
  avatar: string;
  phone: string;
  isActive: boolean;
  isEmailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  lastLogin?: Date;
  failedOtpAttempts: number;
  otpLockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser, IUserModel>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
    },
    tenantName: {
      type: String,
      trim: true,
      maxlength: [50, 'Tenant name cannot exceed 50 characters'],
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      default: '',
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'User role is required'],
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    failedOtpAttempts: { type: Number, default: 0 },
    otpLockedUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for email uniqueness within tenant
// UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, role: 1 });

// Compare password method
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

// If you also want to hash passwords when updated via findOneAndUpdate
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as Partial<IUser>;
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
    this.setUpdate(update);
  }
  next();
});

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

export const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
