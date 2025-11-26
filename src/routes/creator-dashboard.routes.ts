import { Router, type RequestHandler } from 'express';
import { authenticate } from '../middlewares/auth.middleware.ts';
import CreatorDashboardController from '../controllers/creator-dashboard.controller.ts';
import type { AuthRequest } from '../interfaces/index.ts';

const router = Router();

const dashboardHandler: RequestHandler = async (req, res, next) => {
  try {
    // Manually call the authenticate middleware logic
    await new Promise<void>((resolve, reject) => {
      authenticate(req as AuthRequest, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Now call the controller
    await CreatorDashboardController.getDashboard(req as AuthRequest, res, next);
  } catch (error) {
    next(error);
  }
};

router.get('/dashboard', dashboardHandler);

export default router;
