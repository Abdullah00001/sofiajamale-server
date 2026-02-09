import { Router } from 'express';
import { container } from 'tsyringe';

import {
  handleMulterError,
  uploadArray,
} from '@/middlewares/multer.middleware';
import { validateReqBody } from '@/middlewares/validateReqBody.middleware';
import { AdminBagController } from '@/modules/adminBag/adminBag.controllers';
import { AdminBagMiddleware } from '@/modules/adminBag/adminBag.middlewares';
import { CreateAdminBagSchema } from '@/modules/adminBag/adminBag.schemas';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';

const router = Router();

const controller = container.resolve(AdminBagController);
container.resolve(AdminBagMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

router
  .route('/admin/bags')
  .post(
    authMiddleware.checkAdminAccessToken,
    uploadArray('bagImages', 10),
    handleMulterError,
    validateReqBody(CreateAdminBagSchema),
    controller.createAdminBag
  )
  .get(authMiddleware.checkAdminAccessToken, controller.getAdminBags);

export default router;
