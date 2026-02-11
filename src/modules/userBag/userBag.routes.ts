import { Router } from 'express';
import { container } from 'tsyringe';

import {
  uploadFields,
  handleMulterError,
  FieldConfig,
} from '@/middlewares/multer.middleware';
import {
  createCollectionRequestBodyValidationMiddleware,
  validateReqBody,
} from '@/middlewares/validateReqBody.middleware';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { UserBagController } from '@/modules/userBag/userBag.controllers';
import { UserBagMiddleware } from '@/modules/userBag/userBag.middlewares';
import {
  CreateCollectionSchema,
  PatchCollectionSchema,
} from '@/modules/userBag/userBag.schemas';

const router = Router();

const controller = container.resolve(UserBagController);
const middleware = container.resolve(UserBagMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

// USer Routes
const createCollectionImageFields: FieldConfig[] = [
  { name: 'images', maxCount: 9,optional:false },
  { name: 'primaryImage', maxCount: 1,optional:false },
  { name: 'receiptImage', maxCount: 1,optional:true },
];
router
  .route('/collections')
  .post(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    uploadFields(createCollectionImageFields),
    handleMulterError,
    createCollectionRequestBodyValidationMiddleware(CreateCollectionSchema),
    controller.createCollection
  );

router
  .route('/collections/:id')
  .get(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    middleware.findBagCollectionById,
    controller.getCollectionById
  )
  .put(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    middleware.findBagCollectionById,
    validateReqBody(PatchCollectionSchema),
  )
  .patch(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    middleware.findBagCollectionById,
    validateReqBody(PatchCollectionSchema),
    controller.patchCollection
  )
  .delete(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    middleware.findBagCollectionById,
    controller.deleteCollection
  );

export default router;
