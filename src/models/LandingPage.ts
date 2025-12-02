import mongoose, { Schema } from 'mongoose';
import type { ILandingPage } from '../interfaces/index.ts';

const LandingPageSchema = new Schema<ILandingPage>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
    brandName: {
      type: String,
      default: '',
    },
    sections: {
      section1: {
        image: { type: String, default: '' },
      },
      section2: {
        description: { type: String, default: '' },
        image: { type: String, default: '' },
      },
      section3: {
        description: { type: String, default: '' },
        image: { type: String, default: '' },
      },
      section4: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
      },
      section5: {
        testimonials: [
          {
            image: { type: String, default: '' },
            name: { type: String, default: '' },
            jobTitle: { type: String, default: '' },
            remark: { type: String, default: '' },
          },
        ],
      },
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure one landing page per tenant
LandingPageSchema.index({ tenantId: 1 }, { unique: true });

export const LandingPage = mongoose.model<ILandingPage>('LandingPage', LandingPageSchema);
