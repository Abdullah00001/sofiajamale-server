import { Request, Response, NextFunction, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseMiddleware } from '@/core/base_classes/base.middleware';
import ModelModel from '@/modules/model/model.model';

@injectable()
export class ModelMiddleware extends BaseMiddleware {
  public findModelById: RequestHandler;

  constructor() {
    super();
    this.findModelById = this.wrap(this._findModelById);
  }

  private async _findModelById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { id } = req.params;
    const model = await ModelModel.findById(id);
    if (!model) {
      res.status(404).json({
        success: false,
        status: 404,
        message: `Model with this id ${id} not found`,
      });
      return;
    }
    req.model = model;
    next();
  }
}
