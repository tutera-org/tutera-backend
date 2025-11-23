import { Router } from 'express';
import {
  initiatePayment,
  tranzaktWebhook,
  getPaymentStatus,
  getUserPayments,
  getCreatorEarnings,
} from '../controllers/payment.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';

const router = Router();

// Public webhook endpoint (no auth required - Tranzakt calls this)
router.post('/webhook', tranzaktWebhook);

// Public payment status check (no auth required)
router.get('/status/:invoiceId', getPaymentStatus);

// Protected endpoints (require authentication)
router.post('/create', authenticate, initiatePayment);
router.get('/user/payments', authenticate, getUserPayments);
router.get('/creator/earnings', authenticate, getCreatorEarnings);

export default router;
