import { Router } from 'express';
import { container } from 'tsyringe';

import upload from '@/middlewares/multer.middleware';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import { BlogController } from '@/modules/blog/blog.controllers';
import { BlogMiddleware } from '@/modules/blog/blog.middlewares';

const router = Router();

const controller = container.resolve(BlogController);
const middleware = container.resolve(BlogMiddleware);
const authMiddleware = container.resolve(AuthMiddleware);

// admin routes
router
  .route('/admin/blogs')
  .post(
    authMiddleware.checkAdminAccessToken,
    upload.single('blogImage'),
    controller.createBlog
  )
  .get(authMiddleware.checkAdminAccessToken, controller.retrieveBlogs);

router
  .route('/admin/blogs/:id')
  .get(
    authMiddleware.checkAdminAccessToken,
    middleware.findBlogById,
    controller.retrieveSingleBlog
  )
  .put(
    authMiddleware.checkAdminAccessToken,
    middleware.findBlogById,
    upload.single('blogImage'),
    controller.updateBlogInfoWithImage
  )
  .patch(
    authMiddleware.checkAdminAccessToken,
    middleware.findBlogById,
    controller.updateBlogInfo
  )
  .delete(
    authMiddleware.checkAdminAccessToken,
    middleware.findBlogById,
    controller.deleteBlog
  );

// user routes

router
  .route('/blogs')
  .get(authMiddleware.checkAccessToken, controller.retrieveBlogs);

router
  .route('/blogs/:id')
  .get(
    authMiddleware.checkAccessToken,
    middleware.findBlogById,
    controller.retrieveSingleBlog
  );

export default router;
