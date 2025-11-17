import type { Request } from 'express';
import { Document, Types, Model } from 'mongoose';

// User Roles
// export const UserRole = {
//   SUPER_ADMIN: 'super_admin',
//   INSTITUTION: 'INSTITUTION',
//   INDEPENDENT_CREATOR: 'INDEPENDENT_CREATOR',
//   STUDENT: 'student',
// } as const;

// export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION = 'INSTITUTION',
  INDEPENDENT_CREATOR = 'INDEPENDENT_CREATOR',
  STUDENT = 'STUDENT',
}

// Subscription Plans
export enum SubscriptionPlan {
  FREE_TRIAL = 'free_trial',
  MONTHLY = 'monthly',
  THREE_MONTHS = '3_months',
  SIX_MONTHS = '6_months',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export enum TenantType {
  INSTITUTION = 'INSTITUTION',
  INDEPENDENT_CREATOR = 'INDEPENDENT_CREATOR',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

// Interfaces
export interface ITenant extends Document {
  ownerId: Types.ObjectId;
  name: string;
  type: TenantType;
  slug: string;
  email: string;
  organizationName?: string;
  description?: string;
  website?: string;
  phone?: string;
  logo?: string;
  domain?: string;
  customization: ITenantCustomization;
  subscription: ISubscription;
  isVerified: boolean;
  isActive: boolean;
  violations: IViolation;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export interface ITenantCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  fontFamily?: string;
  bannerUrl?: string;
  allowDownload: boolean;
  emailNotifications: boolean;
  customDomain?: string;
  features?: string[];
}

export interface ISubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  trialEndDate?: Date;
  autoRenew: boolean;
}
export interface IViolation {
  count: number;
  lastViolationDate: Date;
  reasons: string[];
}

export interface IBillingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  taxId?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  fullName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  tenantId?: Types.ObjectId;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getRefreshToken(): string;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  creatorId: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  currency: string;
  category: string;
  level: string;
  duration: number;
  status: CourseStatus;
  tags: string[];
  syllabus: IModule[];
  totalEnrollments: number;
  averageRating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModule {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  lessons: ILesson[];
}

export interface ILesson {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'quiz' | 'assignment';
  content: IContent;
  order: number;
  duration?: number;
  isPreview: boolean;
}

export interface IContent {
  url?: string;
  videoId?: string;
  documentId?: string;
  quizId?: string;
}

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  tenantId: Types.ObjectId;
  status: EnrollmentStatus;
  progress: number;
  completedLessons: Types.ObjectId[];
  lastAccessedAt?: Date;
  completedAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tenantId: Types.ObjectId;
  courseId?: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedia extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  s3Key: string;
  type: 'video' | 'document' | 'image';
  isProtected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  enrollmentId: Types.ObjectId;
  lessonId: Types.ObjectId;
  courseId: Types.ObjectId;
  completed: boolean;
  timeSpent: number;
  lastPosition?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request Extensions
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: [];
  pagination?: IPagination;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Query Options
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  search?: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  tenantId?: string;
  role: UserRole;
  email: string;
}

// Audit Log
export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  tenantId?: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Custom Request with file support
export interface CustomRequest extends Request {
  user?: JwtPayload;
  // files?: Express.Multer.File[];
  // file?: Express.Multer.File;
}

// Email Options
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, unknown>;
}

// Stripe Events
export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

// Analytics
export interface ICourseAnalytics {
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  revenue: number;
  averageRating: number;
}

export interface ITenantAnalytics {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  activeEnrollments: number;
  courseCompletionRate: number;
}

// Video Streaming
export interface VideoStreamOptions {
  range?: string;
  quality?: '360p' | '480p' | '720p' | '1080p';
}

// Course Filter
export interface CourseFilter {
  tenantId?: string;
  category?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  status?: CourseStatus;
}

export interface NotificationPayload {
  userId: string;
  message: string | object;
  type: 'onboarding' | 'course_completion' | 'new_course_upload';
}

export interface INotification extends Document {
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}
