import { Router } from 'express';
import { container } from 'tsyringe';

import {
  handleMulterError,
  uploadSingle,
} from '@/middlewares/multer.middleware';
import { validateReqBody } from '@/middlewares/validateReqBody.middleware';
import { AdminBagController } from '@/modules/adminBag/adminBag.controllers';
import { AdminBagMiddleware } from '@/modules/adminBag/adminBag.middlewares';
import { CreateAdminBagSchema } from '@/modules/adminBag/adminBag.schemas';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';

const router = Router();

const controller = container.resolve(AdminBagController);
const middleware = container.resolve(AdminBagMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

router
  .route('/admin/bags')
  .post(
    authMiddleware.checkAdminAccessToken,
    uploadSingle('bagImage'),
    handleMulterError,
    validateReqBody(CreateAdminBagSchema),
    controller.createAdminBag
  )
  .get(authMiddleware.checkAdminAccessToken, controller.getAdminBags);

router
  .route('/admin/bags/:id')
  .delete(
    authMiddleware.checkAdminAccessToken,
    middleware.findAdminBagById,
    controller.deleteAdminBag
  );

// User Routes
router
  .route('/discover')
  .get(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    controller.getAdminBags
  );

export default router;
