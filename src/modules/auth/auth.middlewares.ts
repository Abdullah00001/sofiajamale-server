import { Request, Response, NextFunction, RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { getRedisClient } from '@/configs/redis.config';
import { BaseMiddleware } from '@/core/base_classes/base.middleware';
import User from '@/modules/auth/auth.model';
import { AccountStatus, IUser } from '@/modules/auth/auth.types';
import { JwtUtils } from '@/utils/jwt.utils';
import { OtpUtils } from '@/utils/otp.utils';
import { PasswordUtils } from '@/utils/password.utils';

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  public checkSignupUserExist: RequestHandler;
  public checkOtpPageToken: RequestHandler;
  public checkOtp: RequestHandler;
  public checkLoginUserExist: RequestHandler;
  public checkPassword: RequestHandler;
  constructor(
    private readonly jwtUtils: JwtUtils,
    private readonly otpUtils: OtpUtils,
    private readonly passwordUtils: PasswordUtils
  ) {
    super();
    this.checkSignupUserExist = this.wrap(this._checkSignupUserExist);
    this.checkOtpPageToken = this.wrap(this._checkOtpPageToken);
    this.checkOtp = this.wrap(this._checkOtp);
    this.checkLoginUserExist = this.wrap(this._checkLoginUserExist);
    this.checkPassword = this.wrap(this._checkPassword);
  }

  private async _checkSignupUserExist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email } = req.body;
    const user = await User.findOne({ email }).lean();
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
    const user = req.user as JwtPayload;
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

  private async _checkLoginUserExist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { email, rememberMe } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid Credential,Check Your Email And Password',
      });
      return;
    }
    if (!user?.isVerified) {
      res.status(401).json({
        success: false,
        message:
          'User with this email not verified,Please verify your account first',
      });
      return;
    }
    if (user?.accountStatus === AccountStatus.BLOCKED) {
      res.status(401).json({
        success: false,
        message:
          'Your account has been blocked,For more information please contact with admin',
      });
      return;
    }
    const userWithRememberMe = { ...user, rememberMe };
    req.user = userWithRememberMe;
    next();
  }

  private async _checkPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const requestPassword = req.body?.password;
    const password = (req?.user as IUser).password;
    const isMatched = await this.passwordUtils.comparePassword(
      requestPassword,
      password
    );
    if (!isMatched) {
      res.status(401).json({
        success: false,
        message: 'Invalid Credential,Check Your Email And Password',
      });
      return;
    }
    next();
  }
}
