import { Router } from 'express';
import { container } from 'tsyringe';

import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { DashboardController } from '@/modules/dashboard/dashboard.controllers';

const router = Router();

const controller = container.resolve(DashboardController);
const authMiddleware = container.resolve(AuthMiddleware);

router.get(
  '/admin/dashboard/stats',
  authMiddleware.checkAdminAccessToken,
  controller.adminDashboardStat
);

export default router;
