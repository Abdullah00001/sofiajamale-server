import { Request, Response, RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { AdminBagService } from '@/modules/adminBag/adminBag.services';
import { IUser } from '@/modules/auth/auth.types';

@injectable()
export class AdminBagController extends BaseController {
  public createAdminBag: RequestHandler;
  public getAdminBags: RequestHandler;
  public deleteAdminBag: RequestHandler;

  constructor(private readonly adminBagService: AdminBagService) {
    super();
    this.createAdminBag = this.wrap(this._createAdminBag);
    this.getAdminBags = this.wrap(this._getAdminBags);
    this.deleteAdminBag = this.wrap(this._deleteAdminBag);
  }

  private async _createAdminBag(req: Request, res: Response): Promise<void> {
    const user = req.user as JwtPayload;
    const { bagBrand, bagModel } = req.body;
    const files = req.file as Express.Multer.File;
    const fileName = files.filename;
    const data = await this.adminBagService.createAdminBag({
      bagBrand,
      bagModel,
      file: fileName,
      user,
    });
    res.status(201).json({
      success: true,
      status: 201,
      message: 'Admin Bag Creation Successful',
      data,
    });
    return;
  }

  private async _getAdminBags(req: Request, res: Response): Promise<void> {
    const user = req.user as JwtPayload | IUser;
    const { page, limit } = req.query as { page?: string; limit?: string };
    const data = await this.adminBagService.getAdminBags({ page, limit, user });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Admin Bags Fetched Successfully',
      ...data,
    });
    return;
  }

  public async _deleteAdminBag(req: Request, res: Response): Promise<void> {
    const bag = req.adminBag;
    await this.adminBagService.deleteAdminBag({ bag });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Admin Bag Deleted Successfully',
    });
    return;
  }
}
