import jwt, { JwtPayload } from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { env } from '@/env';
import { ITokenPayload } from '@/types/jwt.types';

@injectable()
export class JwtUtils {
  generateAccessTokenForUser(payload: ITokenPayload | null): string {
    if (!payload) {
      throw new Error('Generate AccessToken Payload Cant Be Null');
    }

    const expiresAt = payload.rememberMe === true ? '30d' : '3d';

    return jwt.sign(payload, env.JWT_ACCESS_TOKEN_SECRET_KEY as string, {
      expiresIn: expiresAt,
    });
  }

  generateAccessTokenForAdmin(payload: ITokenPayload | null): string {
    if (!payload) {
      throw new Error('Generate AccessToken Payload Cant Be Null');
    }

    return jwt.sign(payload, env.JWT_ACCESS_TOKEN_SECRET_KEY as string, {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: ITokenPayload): string {
    if (!payload) {
      throw new Error('Generate RefreshToken Payload Cant Be Null');
    }

    const expiresAt = payload.rememberMe === true ? '30d' : '3d';

    return jwt.sign(payload, env.JWT_REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: expiresAt,
    });
  }

  verifyAccessToken(token: string | null): JwtPayload {
    if (!token) {
      throw new Error('Access Token Is Missing');
    }

    return jwt.verify(token, env.JWT_ACCESS_TOKEN_SECRET_KEY) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    if (!token) {
      throw new Error('Refresh Token Is Missing');
    }

    return jwt.verify(token, env.JWT_REFRESH_TOKEN_SECRET_KEY) as JwtPayload;
  }
}
