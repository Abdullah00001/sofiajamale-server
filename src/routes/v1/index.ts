import { Router } from 'express';

import AuthRoutes from '@/modules/auth/auth.routes';
import BlogRoutes from '@/modules/blog/blog.routes';
import BrandRoutes from '@/modules/brand/brand.routes';
import LegalRoutes from '@/modules/legal/legal.routes';
import ModelRoutes from '@/modules/model/model.routes';
import ProfileRoutes from '@/modules/profile/profile.routes';
import UserRoutes from '@/modules/user/user.routes';

const routes: Router[] = [
  AuthRoutes,
  ProfileRoutes,
  BrandRoutes,
  BlogRoutes,
  LegalRoutes,
  UserRoutes,
  ModelRoutes,
];

const v1Routes = Router();

routes.forEach((route) => v1Routes.use(route));

export default v1Routes;
