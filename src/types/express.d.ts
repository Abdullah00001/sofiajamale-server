import { JwtPayload } from 'jsonwebtoken';

import { IUser } from '@/modules/auth/auth.types';
import { IBlog } from '@/modules/blog/blog.types';
import { IBrand } from '@/modules/brand/brand.types';
import { IModel } from '@/modules/model/model.types';
import { IWishlist } from '@/modules/wishlist/wishlist.types';

declare global {
  namespace Express {
    interface Request {
      fileLimit?: number;
      fieldName?: string;
      user: JwtPayload | IUser;
      brand: IBrand;
      blog: IBlog;
      getUser: IUser;
      model: IModel;
      wish: IWishlist;
    }
  }
}
