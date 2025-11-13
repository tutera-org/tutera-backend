import mongoose, { Schema } from 'mongoose';
import type { ITenant } from '../interfaces/index.ts';
import { SubscriptionPlan, SubscriptionStatus } from '../interfaces/index.ts';
import { TenantType } from '../interfaces/index.ts';
const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      unique: true,
      trim: true,
      index: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: Object.values(TenantType),
      required: [true, 'Tenant type is required'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    website: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    organizationName: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    customization: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#10B981' },
      logoUrl: { type: String },
      bannerUrl: { type: String },
      customDomain: { type: String },
      emailNotifications: { type: Boolean, default: true },
      allowDownload: { type: Boolean, default: false },
      fontFamily: { type: String, default: 'Arial, sans-serif' },
      features: [{ type: String }],
    },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SubscriptionPlan),
        default: SubscriptionPlan.MONTHLY,
      },
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.TRIAL,
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        required: true,
      },
      trialEndDate: {
        type: Date,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    violations: {
      count: {
        type: Number,
        default: 0,
      },
      lastViolationDate: {
        type: Date,
      },
      reasons: [
        {
          type: String,
        },
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// TenantSchema.index({ slug: 1 });
// TenantSchema.index({ email: 1 });
TenantSchema.index({ ownerId: 1, isActive: 1 });
TenantSchema.index({ 'subscription.status': 1, 'subscription.endDate': 1 });

// Create slug from name
TenantSchema.pre('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
  next();
});

// Pre-save middleware to set trial end date
TenantSchema.pre('save', function (next) {
  if (this.isNew && this.subscription.status === SubscriptionStatus.TRIAL) {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 60); // 2 months trial
    this.subscription.trialEndDate = trialEndDate;
    this.subscription.endDate = trialEndDate;
  }
  next();
});

// Virtual for checking if subscription is active
TenantSchema.virtual('isSubscriptionActive').get(function () {
  return (
    this.subscription.status === SubscriptionStatus.ACTIVE ||
    (this.subscription.status === SubscriptionStatus.TRIAL &&
      this.subscription.endDate > new Date())
  );
});

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
