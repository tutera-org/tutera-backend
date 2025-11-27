import { Router, type RequestHandler } from 'express';
import authController from '../controllers/auth.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { RequestValidator } from '../middlewares/validators.middleware.ts';
import {
  registerSchema,
  loginSchema,
  learnerRegisterSchema,
} from '../validations/auth.validator.ts';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 *
 * api/v1/auth/register/institution:
 *   post:
 *     summary: Register a new institution user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, INSTITUTION, INDEPENDENT_CREATOR, student]
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/register/institution',
  RequestValidator(registerSchema),
  authController.registerInstitution
);

router.post(
  '/register/learner',
  RequestValidator(learnerRegisterSchema),
  authController.registerLearner
);

router.patch(
  '/users/update',
  RequestValidator(learnerRegisterSchema),
  authController.updateUserDetails
);

router.post('/login', RequestValidator(loginSchema), authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/request-password-reset', authController.requestPasswordReset);
router.patch('/reset-password', authController.resetPassword);
router.patch('/change-password', authController.changePassword);
router.post('/refresh-otp', authenticate as unknown as RequestHandler, authController.refreshOtp);
router.get('/me', authenticate as unknown as RequestHandler, authController.getCurrentUser);

router.post('/logout', authenticate as unknown as RequestHandler, authController.logout);

export default router;
