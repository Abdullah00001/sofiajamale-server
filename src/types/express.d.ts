import { JwtPayload } from 'jsonwebtoken';

import { IUser } from '@/modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | IUser;
    }
  }
}
