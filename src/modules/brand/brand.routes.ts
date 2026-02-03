import { Router } from 'express';
import { container } from 'tsyringe';

import upload from '@/middlewares/multer.middleware';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { BrandController } from '@/modules/brand/brand.controllers';
import { BrandMiddleware } from '@/modules/brand/brand.middlewares';

const router = Router();

const authMiddleware = container.resolve(AuthMiddleware);

const controller = container.resolve(BrandController);
const brandMiddleware = container.resolve(BrandMiddleware);

// User Routes
router
  .route('/brands')
  .get(
    authMiddleware.checkAccessToken,
    authMiddleware.checkUserAccountStatus,
    controller.getBrands
  );

router
  .route('/brands/search')
  .get(authMiddleware.checkAccessToken, controller.searchBrand);

// Admin Routes
router
  .route('/admin/brands')
  .post(
    authMiddleware.checkAdminAccessToken,
    upload.single('brandLogo'),
    controller.createBrand
  )
  .get(authMiddleware.checkAdminAccessToken, controller.getBrands);

router
  .route('/admin/brands/search')
  .get(authMiddleware.checkAdminAccessToken, controller.searchBrand);

router
  .route('/admin/brands/:id')
  .put(
    authMiddleware.checkAdminAccessToken,
    brandMiddleware.findBrandById,
    upload.single('brandLogo'),
    controller.editBrandInfo
  )
  .patch(
    authMiddleware.checkAdminAccessToken,
    brandMiddleware.findBrandById,
    controller.editBrandName
  )
  .delete(
    authMiddleware.checkAdminAccessToken,
    brandMiddleware.findBrandById,
    controller.deleteBrand
  );

export default router;
