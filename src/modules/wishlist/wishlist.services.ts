import { extname, join } from 'path';

import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { CreateWishDTO } from '@/modules/wishlist/wishlist.dto';
import Wishlist from '@/modules/wishlist/wishlist.model';
import {
  IPriceDescription,
  IWishlist,
} from '@/modules/wishlist/wishlist.types';
import { S3Utils } from '@/utils/s3.utils';
import { SystemUtils } from '@/utils/system.utils';

@injectable()
export class WishlistService {
  constructor(
    private readonly s3Utils: S3Utils,
    private readonly systemUtils: SystemUtils
  ) {}

  async createWish({
    user,
    brandId,
    modelId,
    priority,
    color,
    latherType,
    note,
    priceDescription,
    images,
  }: {
    user: JwtPayload;
    brandId: string;
    modelId: string;
    priority: string;
    color: string;
    latherType: string;
    note?: string;
    priceDescription: IPriceDescription;
    images: string[];
  }): Promise<CreateWishDTO> {
    const fileInfos: { path: string; mimeType: string; s3Key: string }[] =
      images.map((file) => ({
        path: join(__dirname, '../../../public/temp', file),
        mimeType: extname(file),
        s3Key: `wishList/${uuidv4()}/${Date.now()}${extname(file)}`,
      }));
    try {
      const urls = await Promise.all(
        fileInfos.map(({ path, mimeType, s3Key }) =>
          this.s3Utils.singleUpload({ filePath: path, mimeType, key: s3Key })
        )
      );
      const newWish = new Wishlist({
        userId: new Types.ObjectId(user._id as string),
        brandId: new Types.ObjectId(brandId),
        modelId: new Types.ObjectId(modelId),
        priority,
        color,
        latherType,
        note,
        priceDescription,
        images: urls,
      });
      await newWish.save();
      await newWish.populate([
        { path: 'brandId', select: '_id brandName brandLogo' },
        { path: 'modelId', select: '_id modelName modelImage brandId' },
      ]);
      return CreateWishDTO.fromEntity(newWish);
    } catch (error) {
      await Promise.all(
        fileInfos.map(({ s3Key }) => this.s3Utils.singleDelete({ key: s3Key }))
      );
      if (error instanceof Error) throw error;
      throw new Error('An unexpected error occurred on create wish service');
    }
  }

  async deleteWish({ wish }: { wish: IWishlist }): Promise<void> {
    try {
      const keys = wish.images.map((url) =>
        this.systemUtils.extractS3KeyFromUrl(url)
      );
      await Promise.all(keys.map((key) => this.s3Utils.singleDelete({ key })));
      await Wishlist.deleteOne({ _id: wish._id });
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('An unexpected error occurred on delete wish service');
    }
  }
}
