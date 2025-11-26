import { Router } from 'express';
import landingPageController from '../controllers/landing-page.controller.ts';

const router = Router();

// Public routes (no authentication required)
router.get('/landing-page/:tenantSlug', landingPageController.getPublicLandingPage);

export default router;
