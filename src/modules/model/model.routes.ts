import { Router } from 'express';
import { container } from 'tsyringe';

import upload from '@/middlewares/multer.middleware';
import { validateReqBody } from '@/middlewares/validateReqBody.middleware';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { ModelController } from '@/modules/model/model.controllers';
import { ModelMiddleware } from '@/modules/model/model.middlewares';
import {
  CreateModelSchema,
  UpdateModelSchema,
} from '@/modules/model/model.schemas';

const router = Router();

const controller = container.resolve(ModelController);
const middleware = container.resolve(ModelMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

router
  .route('/admin/model')
  .post(
    authMiddleware.checkAdminAccessToken,
    upload.single('modelImage'),
    validateReqBody(CreateModelSchema),
    controller.createModel
  )
  .get(authMiddleware.checkAdminAccessToken, controller.getModels);

router
  .route('/admin/model/:id')
  .put(
    authMiddleware.checkAdminAccessToken,
    middleware.findModelById,
    upload.single('modelImage'),
    validateReqBody(UpdateModelSchema),
    controller.updateModelWithImage
  )
  .patch(
    authMiddleware.checkAdminAccessToken,
    middleware.findModelById,
    validateReqBody(UpdateModelSchema),
    controller.updateModelWithoutImage
  )
  .delete(
    authMiddleware.checkAdminAccessToken,
    middleware.findModelById,
    controller.deleteModel
  )
  .get(
    authMiddleware.checkAdminAccessToken,
    middleware.findModelById,
    controller.getSingleModel
  );

router.route('/admin/model/search').get(authMiddleware.checkAdminAccessToken);

// user routes

router
  .route('/model')
  .get(authMiddleware.checkAccessToken, controller.getModels);

export default router;
