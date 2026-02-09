import { Request, Response, RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { AdminBagService } from '@/modules/adminBag/adminBag.services';

@injectable()
export class AdminBagController extends BaseController {
  public createAdminBag: RequestHandler;
  public getAdminBags:RequestHandler;

  constructor(private readonly adminBagService: AdminBagService) {
    super();
    this.createAdminBag = this.wrap(this._createAdminBag);
    this.getAdminBags = this.wrap(this._getAdminBags);
  }

  private async _createAdminBag(req: Request, res: Response): Promise<void> {
    const user = req.user as JwtPayload;
    const { bagBrand, bagModel } = req.body;
    const files = req.files as Express.Multer.File[];
    const fileNames = files.map((file) => file.filename);
    const data = await this.adminBagService.createAdminBag({
      bagBrand,
      bagModel,
      files: fileNames,
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
    const data = await this.adminBagService.getAdminBags();
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Admin Bags Fetched Successfully',
      data,
    });
    return;
  }
}
