import { Request, Response, NextFunction, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { getRedisClient } from '@/configs/redis.config';
import { BaseMiddleware } from '@/core/base_classes/base.middleware';
import User from '@/modules/auth/auth.model';
import { JwtUtils } from '@/utils/jwt.utils';
import { OtpUtils } from '@/utils/otp.utils';

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  public checkSignupUserExist: RequestHandler;
  public checkOtpPageToken: RequestHandler;
  public checkOtp: RequestHandler;
  constructor(
    private readonly jwtUtils: JwtUtils,
    private readonly otpUtils: OtpUtils
  ) {
    super();
    this.checkSignupUserExist = this.wrap(this._checkSignupUserExist);
    this.checkOtpPageToken = this.wrap(this._checkOtpPageToken);
    this.checkOtp = this.wrap(this._checkOtp);
  }

  private async _checkSignupUserExist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    if (user) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exist',
      });
      return;
    }
    next();
  }
  private async _checkOtpPageToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const token = this.jwtUtils.extractToken(req);
    if (!token) {
      res.status(401).json({ success: false, message: 'jwt token not found' });
      return;
    }
    const decoded = this.jwtUtils.verifyOtpPageToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: 'invalid jwt token' });
      return;
    }
    req.user = decoded;
    next();
  }

  private async _checkOtp(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    const { otp } = req.body;
    // get the redis client
    const redisClient = getRedisClient();
    const hashedOtp = await redisClient.get(`user:${user.sub}:otp`);
    if (!hashedOtp) {
      res.status(401).json({ success: false, message: 'otp has been expired' });
      return;
    }
    const isMatched = this.otpUtils.compareOtp({ hashedOtp, otp });
    if (!isMatched) {
      res.status(401).json({ success: false, message: 'invalid otp' });
      return;
    }
    next();
  }
}
