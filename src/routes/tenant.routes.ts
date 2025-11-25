import { Router, type RequestHandler } from 'express';
import tenantController from '../controllers/tenant.controller.ts';
import { authenticate, authorize } from '../middlewares/auth.middleware.ts';
import { RequestValidator } from '../middlewares/validators.middleware.ts';
//import { checkSubscription } from '../middlewares/subscription.middleware';
import { UserRole } from '../interfaces/index.ts';
import {
  updateTenantSchema,
  //subscribeSchema,
} from '../validations/tenant.validator.ts';
// import { paginationSchema } from '../validators/common.validator';

const router = Router();

// router.get('/', validate(paginationSchema), tenantController.getPublicTenants);

router.get('/:id', tenantController.getTenantById);

router.put(
  '/:id',
  authenticate as unknown as RequestHandler,
  authorize(UserRole.INSTITUTION, UserRole.INDEPENDENT_CREATOR) as unknown as RequestHandler,
  RequestValidator(updateTenantSchema),
  tenantController.updateTenant
);

// router.post(
//   '/:id/subscribe',
//   authenticate,
//   authorize(UserRole.INSTITUTION, UserRole.INDEPENDENT_CREATOR),
//   validate(subscribeSchema),
//   tenantController.subscribeToPlan
// );

export default router;
