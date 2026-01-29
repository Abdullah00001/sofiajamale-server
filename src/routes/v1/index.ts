import { Router } from 'express';

import AuthRoutes from '@/modules/auth/auth.routes';

const routes: Router[] = [AuthRoutes];

const v1Routes = Router();

routes.forEach((route) => v1Routes.use(route));

export default v1Routes;
