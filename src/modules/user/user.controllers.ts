import { Request, Response, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { GetSingleUserResponseDTO } from '@/modules/user/user.dto';
import { UserService } from '@/modules/user/user.services';

@injectable()
export class UserController extends BaseController {
  public getUsers: RequestHandler;
  public getSingleUser: RequestHandler;
  public changeUserAccountStatus: RequestHandler;

  constructor(private readonly userService: UserService) {
    super();
    this.getUsers = this.wrap(this._getUsers);
    this.getSingleUser = this.wrap(this._getSingleUser);
    this.changeUserAccountStatus = this.wrap(this._changeUserAccountStatus);
  }

  private async _getUsers(req: Request, res: Response): Promise<void> {
    const query = req.query as {
      page: string | null;
      limit: string | null;
      sortBy: '1' | '-1' | null;
    };
    const data = await this.userService.getUsers({ params: query });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'User Retrieve Successful',
      ...data,
    });
    return;
  }

  private async _getSingleUser(req: Request, res: Response): Promise<void> {
    const user = req.getUser;
    const data = GetSingleUserResponseDTO.fromEntity(user);
    res.status(200).json({
      success: true,
      status: 200,
      message: 'User Retrieve Successful',
      data,
    });
    return;
  }

  private async _changeUserAccountStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    const { accountStatus } = req.body;
    const user = req.getUser;
    const data = await this.userService.changeUserAccountStatus({accountStatus,userId:user._id});
    res.status(200).json({
      success: true,
      status: 200,
      message: 'User Retrieve Successful',
      data,
    });
    return;
  }
}
