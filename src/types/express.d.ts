import { JwtPayload } from 'jsonwebtoken';

import { IUser } from '@/modules/auth/auth.types';
import { IBlog } from '@/modules/blog/blog.types';
import { IBrand } from '@/modules/brand/brand.types';
import { IModel } from '@/modules/model/model.types';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | IUser;
      brand: IBrand;
      blog: IBlog;
      getUser:IUser;
      model:IModel
    }
  }
}
