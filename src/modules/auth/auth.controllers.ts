import { Request, Response, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { AuthService } from '@/modules/auth/auth.services';
import { IUser } from '@/modules/auth/auth.types';

@injectable()
export class AuthController extends BaseController {
  public signup: RequestHandler;
  public verifyOtp: RequestHandler;
  public resendOtp: RequestHandler;
  public login: RequestHandler;

  constructor(private readonly authService: AuthService) {
    super();
    this.signup = this.wrap(this._signup);
    this.verifyOtp = this.wrap(this._verifyOtp);
    this.resendOtp = this.wrap(this._resendOtp);
    this.login = this.wrap(this._login);
  }

  private async _signup(req: Request, res: Response): Promise<void> {
    const data = await this.authService.createUser(req.body);
    res.status(200).json({ success: true, message: 'Signup successful', data });
    return;
  }

  private async _verifyOtp(req: Request, res: Response): Promise<void> {
    const { accessToken } = await this.authService.verifyOtp({
      user: req.user,
    });
    res.status(200).json({
      success: true,
      message: 'otp verification successful',
      accessToken,
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
      accessToken,
    });
    return;
  }
}
