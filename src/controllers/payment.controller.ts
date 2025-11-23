import type { Request, Response } from 'express';
import { createInvoice } from '../services/payment.service.ts';
import { Payment } from '../models/Payment.ts';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Define a proper error interface for axios errors
interface AxiosError extends Error {
  response?: {
    data?: unknown;
    status?: number;
  };
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, unknown>;
  };
}

export const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Require authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const {
      amount,
      payerEmail,
      payerName,
      payerPhoneNumber,
      creatorId,
      paymentType = 'other',
      relatedItemId,
    } = req.body;

    // Use authenticated user info if not provided
    const finalPayerEmail = payerEmail || req.user.email;
    const finalPayerName = payerName || req.user.name;

    const invoice = await createInvoice({
      amount,
      payerEmail: finalPayerEmail,
      payerName: finalPayerName,
      payerPhoneNumber,
      userId: req.user.id,
      creatorId,
      paymentType,
      relatedItemId,
    });

    // Save payment record to database
    const payment = new Payment({
      invoiceId: invoice.data.id,
      amount: invoice.data.amount,
      totalAmount: invoice.data.totalAmount,
      status: invoice.data.invoiceStatus,
      payerName: invoice.data.payerName,
      payerEmail: invoice.data.payerEmail,
      payerPhoneNumber: invoice.data.payerPhoneNumber,
      collectionName: invoice.data.collectionName,
      paymentUrl: invoice.data.paymentUrl,
      dateCreated: new Date(invoice.data.dateCreated),
      userId: req.user.id,
      creatorId,
      paymentType,
      relatedItemId,
      callBackUrl: invoice.data.callBackUrl,
    });

    await payment.save();

    return res.json({
      success: true,
      invoiceId: invoice.data.id,
      paymentUrl: invoice.data.paymentUrl,
      callBackUrl: invoice.data.callBackUrl,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
      invoiceDetails: {
        id: invoice.data.id,
        title: invoice.data.title,
        amount: invoice.data.amount,
        totalAmount: invoice.data.totalAmount,
        status: invoice.data.invoiceStatus,
        collectionName: invoice.data.collectionName,
        payerName: invoice.data.payerName,
        payerEmail: invoice.data.payerEmail,
        payerPhoneNumber: invoice.data.payerPhoneNumber,
        dateCreated: invoice.data.dateCreated,
        paymentUrl: invoice.data.paymentUrl,
      },
      requestBody: req.body,
    });
  } catch (err: unknown) {
    console.error('Payment Error Details:', {
      message: (err as Error).message,
      response: (err as AxiosError).response?.data,
      status: (err as AxiosError).response?.status,
      config: {
        url: (err as AxiosError).config?.url,
        method: (err as AxiosError).config?.method,
        headers: (err as AxiosError).config?.headers,
      },
    });
    return res.status(500).json({
      success: false,
      message: 'Could not create invoice',
      error:
        ((err as AxiosError).response?.data as { message?: string })?.message ||
        (err as Error).message,
    });
  }
};

export const tranzaktWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    console.log('Webhook received:', event);

    // Validate webhook payload
    if (!event || !event.event || !event.data) {
      console.error('Invalid webhook payload:', event);
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Handle different webhook events
    switch (event.event) {
      case 'invoice.paid': {
        const paidInvoiceId = event.data.id;
        const paidAmount = event.data.amount;
        const paidAt = event.data.datePaid;

        console.log(`Invoice ${paidInvoiceId} paid with amount ${paidAmount} at ${paidAt}`);

        try {
          // Update payment status in database
          const payment = await Payment.findOneAndUpdate(
            { invoiceId: paidInvoiceId },
            {
              status: 'Paid',
              datePaid: paidAt ? new Date(paidAt) : new Date(),
            },
            { new: true }
          );

          if (!payment) {
            console.error(`Payment not found for invoice: ${paidInvoiceId}`);
          } else {
            console.log(`Payment ${paidInvoiceId} updated to Paid status`);
          }
        } catch (dbError) {
          console.error('Database error updating payment:', dbError);
        }

        break;
      }

      case 'invoice.failed': {
        const failedInvoiceId = event.data.id;
        const failureReason = event.data.failureReason;

        console.log(`Invoice ${failedInvoiceId} failed: ${failureReason}`);

        try {
          // Update payment status in database
          const payment = await Payment.findOneAndUpdate(
            { invoiceId: failedInvoiceId },
            {
              status: 'Failed',
              failureReason,
            },
            { new: true }
          );

          if (!payment) {
            console.error(`Payment not found for invoice: ${failedInvoiceId}`);
          } else {
            console.log(`Payment ${failedInvoiceId} updated to Failed status`);
          }
        } catch (dbError) {
          console.error('Database error updating payment:', dbError);
        }

        break;
      }

      case 'invoice.expired': {
        const expiredInvoiceId = event.data.id;

        console.log(`Invoice ${expiredInvoiceId} expired`);

        try {
          // Update payment status in database
          const payment = await Payment.findOneAndUpdate(
            { invoiceId: expiredInvoiceId },
            {
              status: 'Expired',
            },
            { new: true }
          );

          if (!payment) {
            console.error(`Payment not found for invoice: ${expiredInvoiceId}`);
          } else {
            console.log(`Payment ${expiredInvoiceId} updated to Expired status`);
          }
        } catch (dbError) {
          console.error('Database error updating payment:', dbError);
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getUserPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { status, paymentType, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Build query
    const query: Record<string, unknown> = { userId };
    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    return res.json({
      success: true,
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: unknown) {
    console.error('Error fetching user payments:', (err as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user payments',
    });
  }
};

export const getCreatorEarnings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const creatorId = req.user.id;
    const { status = 'Paid', paymentType, page = 1, limit = 10 } = req.query;

    // Build query for creator's earnings
    const query: Record<string, unknown> = { creatorId, status };
    if (paymentType) query.paymentType = paymentType;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return res.json({
      success: true,
      payments,
      earnings: {
        total: totalEarnings,
        count: total,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: unknown) {
    console.error('Error fetching creator earnings:', (err as Error).message);
    return res.status(500).json({
      success: false,
      message: 'Error fetching creator earnings',
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const invoiceId = req.params.invoiceId;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID is required',
      });
    }

    // First try to get from database
    const payment = await Payment.findOne({ invoiceId });

    if (payment) {
      return res.json({
        success: true,
        invoiceId: payment.invoiceId,
        status: payment.status,
        amount: payment.amount,
        totalAmount: payment.totalAmount,
        paymentUrl: payment.paymentUrl,
        dateCreated: payment.dateCreated,
        datePaid: payment.datePaid || null,
        collectionName: payment.collectionName,
        payerName: payment.payerName,
        payerEmail: payment.payerEmail,
        failureReason: payment.failureReason || null,
        source: 'database',
      });
    }

    // If not found in database, fetch from Tranzakt API
    const tranzakt = await import('../utils/tranzakt.ts').then((m) => m.default);
    const response = await tranzakt.get(`/api/v1/invoices/${invoiceId}`);
    const invoice = response.data;

    // Save to database for future queries
    const newPayment = new Payment({
      invoiceId: invoice.id,
      amount: invoice.amount,
      totalAmount: invoice.totalAmount,
      status: invoice.invoiceStatus,
      payerName: invoice.payerName,
      payerEmail: invoice.payerEmail,
      payerPhoneNumber: invoice.payerPhoneNumber,
      collectionName: invoice.collectionName,
      paymentUrl: invoice.paymentUrl,
      dateCreated: new Date(invoice.dateCreated),
      datePaid: invoice.datePaid ? new Date(invoice.datePaid) : undefined,
    });

    await newPayment.save();

    return res.json({
      success: true,
      invoiceId: invoice.id,
      status: invoice.invoiceStatus,
      amount: invoice.amount,
      totalAmount: invoice.totalAmount,
      paymentUrl: invoice.paymentUrl,
      dateCreated: invoice.dateCreated,
      datePaid: invoice.datePaid || null,
      collectionName: invoice.collectionName,
      payerName: invoice.payerName,
      payerEmail: invoice.payerEmail,
      source: 'api',
    });
  } catch (err: unknown) {
    console.error(
      'Error fetching payment status:',
      (err as AxiosError).response?.data || (err as Error).message
    );

    if ((err as AxiosError).response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error:
        ((err as AxiosError).response?.data as { message?: string })?.message ||
        (err as Error).message,
    });
  }
};
