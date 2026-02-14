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
import { validateReqQuery } from '@/middlewares/validateReqQuery.middleware';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { UserBagController } from '@/modules/userBag/userBag.controllers';
import { UserBagMiddleware } from '@/modules/userBag/userBag.middlewares';
import {
  CreateCollectionSchema,
  CollectionQuerySchema,
  PutCollectionSchema,
  PatchUserCollectionSchema,
} from '@/modules/userBag/userBag.schemas';

const router = Router();

const controller = container.resolve(UserBagController);
const middleware = container.resolve(UserBagMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

// USer Routes
const createCollectionImageFields: FieldConfig[] = [
  { name: 'images', maxCount: 9, optional: false },
  { name: 'primaryImage', maxCount: 1, optional: false },
  { name: 'receiptImage', maxCount: 1, optional: true },
];

const updateCollectionImageFields: FieldConfig[] = [
  { name: 'images', maxCount: 9, optional: true },
  { name: 'primaryImage', maxCount: 1, optional: true },
  { name: 'receiptImage', maxCount: 1, optional: true },
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
  )
  .get(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    validateReqQuery(CollectionQuerySchema),
    controller.getUserCollection
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
    uploadFields(updateCollectionImageFields, true),
    handleMulterError,
    validateReqBody(PutCollectionSchema),
    controller.updateCollection
  )
  .patch(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    middleware.findBagCollectionById,
    validateReqBody(PatchUserCollectionSchema),
    controller.patchCollection
  )
  .delete(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    middleware.findBagCollectionById,
    controller.deleteCollection
  );

router
  .route('/admin/collections')
  .get(
    authMiddleware.checkAdminAccessToken,
    validateReqQuery(CollectionQuerySchema),
    controller.getAllCollectionForAdmin
  );

router
  .route('/admin/collections/:id')
  .get(
    authMiddleware.checkAdminAccessToken,
    middleware.findBagCollectionById,
    controller.getCollectionById
  )
  .delete(
    authMiddleware.checkAdminAccessToken,
    middleware.findBagCollectionById,
    controller.deleteOneCollectionByAdmin
  );

export default router;
