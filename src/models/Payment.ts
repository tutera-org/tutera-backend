import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  invoiceId: string;
  amount: number;
  totalAmount: number;
  status: 'Unpaid' | 'Paid' | 'Failed' | 'Expired';
  payerName: string;
  payerEmail: string;
  payerPhoneNumber?: string;
  collectionName: string;
  paymentUrl: string;
  callBackUrl: string;
  dateCreated: Date;
  datePaid?: Date;
  failureReason?: string;
  userId?: string;
  creatorId?: string;
  paymentType: 'course_purchase' | 'subscription' | 'content_access' | 'other';
  relatedItemId?: string;
}

const PaymentSchema: Schema = new Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Failed', 'Expired'],
      default: 'Unpaid',
      required: true,
    },
    payerName: {
      type: String,
      required: true,
    },
    payerEmail: {
      type: String,
      required: true,
    },
    payerPhoneNumber: {
      type: String,
      required: false,
    },
    collectionName: {
      type: String,
      required: true,
    },
    paymentUrl: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      required: true,
    },
    datePaid: {
      type: Date,
      required: false,
    },
    failureReason: {
      type: String,
      required: false,
    },
    callBackUrl: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      required: false,
    },
    creatorId: {
      type: String,
      required: false,
    },
    paymentType: {
      type: String,
      enum: ['course_purchase', 'subscription', 'content_access', 'other'],
      default: 'other',
      required: true,
    },
    relatedItemId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Created indexes for better query performance
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ payerEmail: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ creatorId: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ relatedItemId: 1 });
PaymentSchema.index({ userId: 1, status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
