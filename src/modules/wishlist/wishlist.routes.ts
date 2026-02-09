import { Router } from 'express';
import { container } from 'tsyringe';


import {  uploadSingle } from '@/middlewares/multer.middleware';
import { validateReqBody } from '@/middlewares/validateReqBody.middleware';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { WishlistController } from '@/modules/wishlist/wishlist.controllers';
import { WishlistMiddleware } from '@/modules/wishlist/wishlist.middlewares';
import { CreateWishSchema } from '@/modules/wishlist/wishlist.schemas';

const router = Router();

const controller = container.resolve(WishlistController);
const middleware = container.resolve(WishlistMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

router
  .route('/wishlists')
  .post(
    authMiddleware.checkAccessToken,
    uploadSingle('wishListImage'),
    validateReqBody(CreateWishSchema),
    controller.createWish
  )
  .get(authMiddleware.checkAccessToken);

router
  .route('/wishlists/:id')
  .patch(authMiddleware.checkAccessToken)
  .delete(
    authMiddleware.checkAccessToken,
    middleware.findWishById,
    controller.deleteWish
  );

export default router;
