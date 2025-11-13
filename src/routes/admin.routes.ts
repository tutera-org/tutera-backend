import { Router } from 'express';
import adminController from '../controllers/admin.controller.ts';
import { authenticate, authorize } from '../middlewares/auth.middleware.ts';
import { RequestValidator } from '../middlewares/validators.middleware.ts';
import { UserRole } from '../interfaces/index.ts';
import { paginationSchema } from '../validations/common.validator.ts';

const router = Router();

// All admin routes require super admin role
router.use(authenticate, authorize(UserRole.SUPER_ADMIN));

// User Management
router.get('/users', RequestValidator(paginationSchema), adminController.getAllUsers);
//router.get('/users/:id', adminController.getUserById);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/activate', adminController.activateUser);

// Tenant Management
router.get('/tenants', RequestValidator(paginationSchema), adminController.getAllTenants);
router.post('/tenants/:id/suspend', adminController.suspendTenant);
router.post('/tenants/:id/activate', adminController.activateTenant);

// Audit Logs
router.get('/audit-logs', RequestValidator(paginationSchema), adminController.getAuditLogs);

export default router;
