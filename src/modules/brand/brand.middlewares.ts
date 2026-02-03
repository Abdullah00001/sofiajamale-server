import { Request, Response, NextFunction, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseMiddleware } from '@/core/base_classes/base.middleware';
import Brand from '@/modules/brand/brand.model';

@injectable()
export class BrandMiddleware extends BaseMiddleware {
  public findBrandById: RequestHandler;

  constructor() {
    super();
    this.findBrandById = this.wrap(this._findBrandById);
  }

  private async _findBrandById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    if (!brand) {
      res.status(404).json({
        success: false,
        status: 404,
        message: `Brand with this id ${id} not found`,
      });
      return;
    }
    req.brand = brand;
    next();
  }
}
