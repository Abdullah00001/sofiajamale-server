import { Router } from 'express';

import AuthRoutes from '@/modules/auth/auth.routes';
import BlogRoutes from '@/modules/blog/blog.routes';
import BrandRoutes from '@/modules/brand/brand.routes';
import ProfileRoutes from '@/modules/profile/profile.routes';

const routes: Router[] = [AuthRoutes, ProfileRoutes, BrandRoutes, BlogRoutes];

const v1Routes = Router();

routes.forEach((route) => v1Routes.use(route));

export default v1Routes;
