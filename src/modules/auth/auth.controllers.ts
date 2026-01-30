import { Request, Response, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { AuthService } from '@/modules/auth/auth.services';
import { IUser } from '@/modules/auth/auth.types';
import { JwtUtils } from '@/utils/jwt.utils';

@injectable()
export class AuthController extends BaseController {
  public signup: RequestHandler;
  public verifyOtp: RequestHandler;
  public resendOtp: RequestHandler;
  public login: RequestHandler;
  public findRecoverUser: RequestHandler;
  public recoverUserOtpVerify: RequestHandler;
  public recoverResetPassword: RequestHandler;

  constructor(
    private readonly authService: AuthService,
    private readonly jwtUtils: JwtUtils
  ) {
    super();
    this.signup = this.wrap(this._signup);
    this.verifyOtp = this.wrap(this._verifyOtp);
    this.resendOtp = this.wrap(this._resendOtp);
    this.login = this.wrap(this._login);
    this.findRecoverUser = this.wrap(this._findRecoverUser);
    this.recoverUserOtpVerify = this.wrap(this._recoverUserOtpVerify);
    this.recoverResetPassword = this.wrap(this._recoverResetPassword);
  }

  private async _signup(req: Request, res: Response): Promise<void> {
    const data = await this.authService.createUser(req.body);
    res.status(200).json({ success: true, message: 'Signup successful', data });
    return;
  }

  private async _verifyOtp(req: Request, res: Response): Promise<void> {
    const jwt = this.jwtUtils.extractToken(req);
    const { accessToken } = await this.authService.verifyOtp({
      user: req.user,
      jwt: jwt as string,
    });
    res.status(200).json({
      success: true,
      message: 'otp verification successful',
      data: accessToken,
    });
    return;
  }

  private async _resendOtp(req: Request, res: Response): Promise<void> {
    await this.authService.resendOtp({ user: req.user });
    res.status(200).json({
      success: true,
      message: 'otp resend successful',
    });
    return;
  }

  private async _login(req: Request, res: Response): Promise<void> {
    const { accessToken } = await this.authService.login({
      user: req.user as IUser,
    });
    res.status(200).json({
      success: true,
      message: 'login successful',
      data: accessToken,
    });
    return;
  }

  private async _findRecoverUser(req: Request, res: Response): Promise<void> {
    const { jwt } = await this.authService.findRecoverUser({
      user: req.user as IUser,
    });
    res.status(200).json({
      success: true,
      message: 'User found',
      data: jwt,
    });
    return;
  }

  private async _recoverUserOtpVerify(
    req: Request,
    res: Response
  ): Promise<void> {
    await this.authService.recoverUserVerifyOtp({ user: req.user });
    res.status(200).json({
      success: true,
      message: 'Otp verification successful',
    });
    return;
  }

  private async _recoverResetPassword(
    req: Request,
    res: Response
  ): Promise<void> {
    const { password } = req.body;
    const jwt = this.jwtUtils.extractToken(req);
    await this.authService.recoverResetPassword({
      jwt: jwt as string,
      password,
      user: req.user,
    });
    res.status(200).json({
      success: true,
      message: 'password reset successful',
    });
    return;
  }
}
