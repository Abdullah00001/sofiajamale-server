import { join, extname } from 'node:path';

import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { IUser } from '@/modules/auth/auth.types';
import UserCollection from '@/modules/userBag/userBag.model';
import { TCreateUserCollection } from '@/modules/userBag/userBag.schemas';
import { IUserBag, TFileInfo } from '@/modules/userBag/userBag.types';
import { S3Utils } from '@/utils/s3.utils';
import { Simulation } from '@/utils/simulation.utils';
import { SystemUtils } from '@/utils/system.utils';

@injectable()
export class UserBagService {
  constructor(
    private readonly s3Utils: S3Utils,
    private readonly systemUtils: SystemUtils,
    private readonly simulation: Simulation
  ) {}

  async createCollection({
    bagImages,
    collectionData,
    primaryImage,
    receiptImage,
    user,
  }: {
    user: IUser;
    collectionData: TCreateUserCollection;
    primaryImage: Express.Multer.File;
    receiptImage: Express.Multer.File;
    bagImages: Express.Multer.File[];
  }): Promise<IUserBag> {
    const primaryImageFileInfo: TFileInfo = {
      filePath: join(__dirname, '../../../public/temp', primaryImage.filename),
      mimeType: extname(primaryImage.originalname),
      key: `user-collections/bag-image/${uuidv4()}/${Date.now()}${extname(primaryImage.originalname)}`,
    };
    const receiptImageFile: TFileInfo = {
      filePath: join(__dirname, '../../../public/temp', receiptImage.filename),
      mimeType: extname(receiptImage.originalname),
      key: `user-collections/receipt-image/${uuidv4()}/${Date.now()}${extname(receiptImage.originalname)}`,
    };
    const bagImagesFileInfos: TFileInfo[] = bagImages.map((file) => ({
      filePath: join(__dirname, '../../../public/temp', file.filename),
      mimeType: extname(file.originalname),
      key: `user-collections/bag-image/${uuidv4()}/${Date.now()}${extname(file.originalname)}`,
    }));
    try {
      const [primaryImageUrl, receiptImageUrl] = await Promise.all([
        this.s3Utils.singleUpload(primaryImageFileInfo),
        this.s3Utils.singleUpload(receiptImageFile),
      ]);
      const bagImageUrls = await Promise.all(
        bagImagesFileInfos.map((fileInfo) =>
          this.s3Utils.singleUpload(fileInfo)
        )
      );
      const simulationData = this.simulation.simulateRealisticAIAnalysis();
      const priceStatus = {
        currentValue: simulationData.currentValue,
        changePercentage: simulationData.changePercentage,
        trend: simulationData.trend,
      };
      const newCollection = new UserCollection({
        ...collectionData,
        primaryImage: primaryImageUrl,
        receipt: receiptImageUrl,
        images: bagImageUrls,
        priceStatus,
        userId: user._id,
      });
      await newCollection.save();
      return newCollection;
    } catch (error) {
      await Promise.all([
        this.s3Utils.singleDelete({ key: primaryImageFileInfo.key }),
        this.s3Utils.singleDelete({ key: receiptImageFile.key }),
        ...bagImagesFileInfos.map((fileInfo) =>
          this.s3Utils.singleDelete({ key: fileInfo.key })
        ),
      ]);
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Create Collection Service'
      );
    }
  }

  async deleteCollection({
    collection,
    user,
  }: {
    user: IUser;
    collection: IUserBag;
  }): Promise<void> {
    try {
      const primaryImageKey = this.systemUtils.extractS3KeyFromUrl(
        collection.primaryImage
      );
      let receiptImageKey: string | null = null;
      if (collection.receipt) {
        receiptImageKey = this.systemUtils.extractS3KeyFromUrl(
          collection.receipt
        );
      }
      const bagImageKeys = collection.images.map((imageUrl) =>
        this.systemUtils.extractS3KeyFromUrl(imageUrl)
      );
      await Promise.all([
        this.s3Utils.singleDelete({ key: primaryImageKey }),
        ...(receiptImageKey
          ? [this.s3Utils.singleDelete({ key: receiptImageKey })]
          : []),
        ...bagImageKeys.map((key) => this.s3Utils.singleDelete({ key })),
        UserCollection.deleteOne({ _id: collection._id, userId: user._id }),
      ]);
      return;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Delete Collection Service'
      );
    }
  }

  async patchCollection({
    user,
    collection,
    updateData,
  }: {
    user: IUser;
    collection: IUserBag;
    updateData?: Partial<TCreateUserCollection>;
  }): Promise<IUserBag> {
    try {
      const data = await UserCollection.findOneAndUpdate(
        {
          _id: collection._id,
          userId: user._id,
        },
        updateData,
        { new: true }
      );
      if (!data)
        throw new Error('Something went wrong while updating the collection');
      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Patch Collection Service'
      );
    }
  }
}
