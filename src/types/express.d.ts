import { JwtPayload } from 'jsonwebtoken';

import { IUser } from '@/modules/auth/auth.types';
import { IBlog } from '@/modules/blog/blog.types';
import { IBrand } from '@/modules/brand/brand.types';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | IUser;
      brand: IBrand;
      blog: IBlog;
      getUser:IUser;
    }
  }
}
