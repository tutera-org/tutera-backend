import { Router } from 'express';
import authController from '../controllers/auth.controller.ts';
import { authenticate } from '../middlewares/auth.middleware.ts';
import { RequestValidator } from '../middlewares/validators.middleware.ts';
import { authLimiter } from '../middlewares/rateLimit.middleware.ts';
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
  authLimiter,
  RequestValidator(registerSchema),
  authController.registerInstitution
);

router.post(
  '/register/learner',
  authLimiter,
  RequestValidator(learnerRegisterSchema),
  authController.registerLearner
);

router.patch(
  '/users/update',
  authLimiter,
  RequestValidator(learnerRegisterSchema),
  authController.updateUserDetails
);

router.post('/login', authLimiter, RequestValidator(loginSchema), authController.login);

router.post('/refresh-token', authController.refreshToken);

// router.get('/me', authenticate, authController.getCurrentUser);

router.post('/logout', authenticate, authController.logout);

export default router;

// import express from 'express';
// // import * as authController from '../controllers/auth.controller';
// // import { protect } from '../middlewares/auth.middleware';
// // import { validate } from '../middlewares/validation.middleware';
// // import {
// registerSchema,
// loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators';
// import * as authController from '../controllers/auth.controller';
// import { authenticate } from '../middlewares/auth.middleware';
// import { validate } from '../middlewares/validation.middleware';
// import {
//   registerSchema,
//   loginSchema,
//   emailSchema,
//   resetPasswordSchema,
//   changePasswordSchema,
// } from '../validators';

// const router = express.Router();

// /**
//  * @swagger
//  * /api/v1/auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *               - firstName
//  *               - lastName
//  *               - role
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               firstName:
//  *                 type: string
//  *               lastName:
//  *                 type: string
//  *               role:
//  *                 type: string
//  *                 enum: [institution_admin, independent_creator, student]
//  *               tenantId:
//  *                 type: string
//  *               tenantName:
//  *                 type: string
//  *               tenantType:
//  *                 type: string
//  *                 enum: [institution, independent_creator]
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  *       400:
//  *         description: Validation error
//  */
// router.post('/register', validate(registerSchema), authController.register);

// /**
//  * @swagger
//  * /api/v1/auth/login:
//  *   post:
//  *     summary: Login user
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               tenantSlug:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Login successful
//  *       401:
//  *         description: Invalid credentials
//  */
// router.post('/login', validate(loginSchema), authController.login);

// /**
//  * @swagger
//  * /api/v1/auth/me:
//  *   get:
//  *     summary: Get current user
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Current user data
//  *       401:
//  *         description: Not authenticated
//  */
// router.get('/me', authenticate, authController.getMe);

// /**
//  * @swagger
//  * /api/v1/auth/logout:
//  *   post:
//  *     summary: Logout user
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Logged out successfully
//  */
// router.post('/logout', authenticate, authController.logout);

// /**
//  * @swagger
//  * /api/v1/auth/verify-email/{token}:
//  *   get:
//  *     summary: Verify email address
//  *     tags: [Authentication]
//  *     parameters:
//  *       - in: path
//  *         name: token
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Email verified successfully
//  *       400:
//  *         description: Invalid or expired token
//  */
// router.get('/verify-email/:token', authController.verifyEmail);

// /**
//  * @swagger
//  * /api/v1/auth/forgot-password:
//  *   post:
//  *     summary: Request password reset
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:

// *               - email
//  *             properties:
//  *               email:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password reset email sent
//  *       404:
//  *         description: User not found
//  */
// router.post('/forgot-password', validate(emailSchema), authController.forgotPassword);

// /**
//  * @swagger
//  * /api/v1/auth/reset-password/{token}:
//  *   put:
//  *     summary: Reset password
//  *     tags: [Authentication]
//  *     parameters:
//  *       - in: path
//  *         name: token
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - password
//  *               - confirmPassword
//  *             properties:
//  *               password:
//  *                 type: string
//  *               confirmPassword:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password reset successful
//  *       400:
//  *         description: Invalid or expired token
//  */
// router.put(
// '/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);

// /**
//  * @swagger
//  * /api/v1/auth/update-password:
//  *   put:
//  *     summary: Update password
//  *     tags: [Authentication]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - currentPassword
//  *               - newPassword
//  *               - confirmPassword
//  *             properties:
//  *               currentPassword:
//  *                 type: string
//  *               newPassword:
//  *                 type: string
//  *               confirmPassword:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password updated successfully
//  *       401:
//  *         description: Current password is incorrect
//  */
// router.put(
// '/update-password', protect,
// validate(changePasswordSchema), authController.updatePassword);

// export default router;
