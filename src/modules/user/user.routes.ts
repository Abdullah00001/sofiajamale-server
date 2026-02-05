import { Router } from 'express';
import { container } from 'tsyringe';

import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { UserController } from '@/modules/user/user.controllers';
import { UserMiddleware } from '@/modules/user/user.middlewares';

const router = Router();

const controller = container.resolve(UserController);
const middleware = container.resolve(UserMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

router
  .route('/admin/users')
  .get(authMiddleware.checkAdminAccessToken, controller.getUsers);

router
  .route('/admin/users/:id')
  .get(
    authMiddleware.checkAdminAccessToken,
    middleware.findUserById,
    controller.getSingleUser
  );

router
  .route('/admin/users/:id')
  .patch(
    authMiddleware.checkAdminAccessToken,
    middleware.findUserById,
    controller.changeUserAccountStatus
  );

export default router;
