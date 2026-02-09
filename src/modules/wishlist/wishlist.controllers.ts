import { Request, Response, RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { WishlistService } from '@/modules/wishlist/wishlist.services';

@injectable()
export class WishlistController extends BaseController {
  public createWish: RequestHandler;
  public deleteWish: RequestHandler;

  constructor(private readonly wishlistService: WishlistService) {
    super();
    this.createWish = this.wrap(this._createWish);
    this.deleteWish = this.wrap(this._deleteWish);
  }

  private async _createWish(req: Request, res: Response): Promise<void> {
    const user = req.user as JwtPayload;
    const {
      brandId,
      modelId,
      priority,
      color,
      latherType,
      note,
      currency,
      targetPrice,
    } = req.body;
    const images = req.files as Express.Multer.File[];
    const data = await this.wishlistService.createWish({
      user,
      brandId,
      modelId,
      priority,
      color,
      latherType,
      note,
      priceDescription: { currency, targetPrice },
      images: images.map((file) => file.filename),
    });

    res.status(200).json({
      success: true,
      status: 201,
      message: 'Wish created successfully',
      data,
    });
    return;
  }

  private async _deleteWish(req: Request, res: Response): Promise<void> {
    const wish = req.wish;
    await this.wishlistService.deleteWish({ wish });
    res.status(200).json({
      success: true,
      message: 'Wish deleted successfully',
    });
  }
}
