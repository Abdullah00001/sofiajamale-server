import { join, extname } from 'node:path';

import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { IUser } from '@/modules/auth/auth.types';
import UserCollection from '@/modules/userBag/userBag.model';
import {
  TCollectionQuery,
  TCreateUserCollection,
  TPatchUserCollection,
} from '@/modules/userBag/userBag.schemas';
import {
  IUserBag,
  TCollectionsActions,
  TFileInfo,
} from '@/modules/userBag/userBag.types';
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
    updateData?: Partial<TPatchUserCollection>;
  }): Promise<IUserBag> {
    try {
      const { deletedImageUrl, ...dbUpdateData } = updateData || {};
      if (deletedImageUrl && deletedImageUrl.length > 0) {
        const invalidUrls = deletedImageUrl.filter(
          (url) => !collection.images.includes(url)
        );

        if (invalidUrls.length > 0) {
          throw new Error(
            `The following URLs do not belong to this collection: ${invalidUrls.join(', ')}`
          );
        }
      }

      // Build MongoDB update operations
      const updateOperations: {
        $set?: Partial<TPatchUserCollection>;
        $pull?: { images: { $in: string[] } };
      } = {};

      // Add regular field updates
      if (Object.keys(dbUpdateData).length > 0) {
        updateOperations.$set = dbUpdateData;
      }

      // Add image deletion operations
      if (deletedImageUrl && deletedImageUrl.length > 0) {
        updateOperations.$pull = {
          images: { $in: deletedImageUrl },
        };
      }
      const data = await UserCollection.findOneAndUpdate(
        {
          _id: collection._id,
          userId: user._id,
        },
        updateOperations,
        { new: true }
      );
      if (!data)
        throw new Error('Something went wrong while updating the collection');
      if (
        updateData?.deletedImageUrl &&
        updateData.deletedImageUrl.length > 0
      ) {
        const deletedImageKeys = updateData?.deletedImageUrl?.map((url) =>
          this.systemUtils.extractS3KeyFromUrl(url)
        );
        await Promise.all(
          deletedImageKeys?.map((key) => this.s3Utils.singleDelete({ key }))
        );
      }
      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Patch Collection Service'
      );
    }
  }

  async updateCollection({
    collection,
    user,
    updateData,
    bagImages,
    primaryImage,
    receiptImage,
  }: {
    user: IUser;
    collection: IUserBag;
    updateData?: Partial<TPatchUserCollection>;
    primaryImage?: Express.Multer.File;
    receiptImage?: Express.Multer.File;
    bagImages?: Express.Multer.File[];
  }): Promise<IUserBag> {
    const images: {
      primaryImageFileInfo?: TFileInfo;
      receiptImageFile?: TFileInfo;
      bagImagesFileInfos?: TFileInfo[];
    } = {};
    if (primaryImage) {
      images.primaryImageFileInfo = {
        filePath: join(
          __dirname,
          '../../../public/temp',
          primaryImage.filename
        ),
        mimeType: extname(primaryImage.originalname),
        key: `user-collections/bag-image/${uuidv4()}/${Date.now()}${extname(primaryImage.originalname)}`,
      };
    }
    if (receiptImage) {
      images.receiptImageFile = {
        filePath: join(
          __dirname,
          '../../../public/temp',
          receiptImage.filename
        ),
        mimeType: extname(receiptImage.originalname),
        key: `user-collections/receipt-image/${uuidv4()}/${Date.now()}${extname(receiptImage.originalname)}`,
      };
    }
    if (bagImages && bagImages?.length > 0) {
      images.bagImagesFileInfos = bagImages.map((file) => ({
        filePath: join(__dirname, '../../../public/temp', file.filename),
        mimeType: extname(file.originalname),
        key: `user-collections/bag-image/${uuidv4()}/${Date.now()}${extname(file.originalname)}`,
      }));
    }
    try {
      const changedData: Partial<IUserBag> = {
        ...(updateData as Partial<IUserBag>),
      };
      if (primaryImage && images.primaryImageFileInfo) {
        const url = await this.s3Utils.singleUpload(
          images.primaryImageFileInfo
        );
        changedData.primaryImage = url;
      }
      if (receiptImage && images.receiptImageFile) {
        const url = await this.s3Utils.singleUpload(images.receiptImageFile);
        changedData.receipt = url;
      }
      if (bagImages && bagImages.length > 0 && images.bagImagesFileInfos) {
        const urls = await Promise.all(
          images?.bagImagesFileInfos.map((fileInfo) =>
            this.s3Utils.singleUpload(fileInfo)
          )
        );
        changedData.images = [...collection.images, ...urls];
      }

      const data = await UserCollection.findOneAndUpdate(
        {
          _id: collection._id,
          userId: user._id,
        },
        changedData,
        { new: true }
      );
      if (!data)
        throw new Error('Something went wrong while updating the collection');
      if (
        updateData?.deletedImageUrl &&
        updateData.deletedImageUrl.length > 0
      ) {
        const deletedImageKeys = updateData?.deletedImageUrl?.map((url) =>
          this.systemUtils.extractS3KeyFromUrl(url)
        );
        await Promise.all(
          deletedImageKeys?.map((key) => this.s3Utils.singleDelete({ key }))
        );
      }
      return data;
    } catch (error) {
      if (primaryImage && images.primaryImageFileInfo) {
        await this.s3Utils.singleDelete({
          key: images.primaryImageFileInfo?.key,
        });
      }
      if (receiptImage && images.receiptImageFile) {
        await this.s3Utils.singleDelete({ key: images.receiptImageFile.key });
      }
      if (bagImages && bagImages?.length > 0 && images.bagImagesFileInfos) {
        await Promise.all(
          images.bagImagesFileInfos.map(({ key }) =>
            this.s3Utils.singleDelete({ key })
          )
        );
      }
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Update Collection Service'
      );
    }
  }

  async getAllCollections({
    query,
    user,
  }: {
    user: IUser | JwtPayload;
    query: TCollectionQuery;
  }): Promise<void> {
    try {
      const {
        brand,
        latherType,
        limit: queryLimit,
        page: queryPage,
        productionYear,
        purchaseYear,
        sortByCreatedAt,
        sortByTrending,
        valueRangeMax,
        valueRangeMin,
        isArchived,
      } = query;
      const matchStage: Record<string, any> = {
        userId: user._id,
        isArchived: isArchived ?? false,
      };
      if (brand) {
        matchStage.brandId = new Types.ObjectId(brand);
      }

      if (latherType) {
        matchStage.latherType = latherType;
      }

      if (productionYear) {
        matchStage.productionYear = productionYear;
      }

      if (purchaseYear) {
        matchStage.$expr = {
          $eq: [{ $year: '$purchaseDate' }, purchaseYear],
        };
      }

      if (valueRangeMin !== undefined || valueRangeMax !== undefined) {
        matchStage.purchasePrice = {};
        if (valueRangeMin !== undefined) {
          matchStage.purchasePrice.$gte = valueRangeMin;
        }
        if (valueRangeMax !== undefined) {
          matchStage.purchasePrice.$lte = valueRangeMax;
        }
      }
      // Build sort stage
      const sortStage: Record<string, 1 | -1> = {};

      if (sortByCreatedAt) {
        sortStage.createdAt = sortByCreatedAt as 1 | -1;
      }

      if (sortByTrending) {
        // Assuming priceStatus determines trending
        // 'up' = ascending by priceStatus, 'down' = descending
        sortStage.priceStatus = sortByTrending === 'up' ? 1 : -1;
      }

      // Default sort by createdAt descending if no sort specified
      if (Object.keys(sortStage).length === 0) {
        sortStage.createdAt = -1;
      }
      const page = queryPage ?? 1;
      const limit = queryLimit ?? 10;
      const skip = (page - 1) * limit;
      // output need total bags/collections,total value,average value
      const [result] = await UserCollection.aggregate([
        // Match user's collections with filters
        { $match: matchStage },

        // Facet for parallel processing
        {
          $facet: {
            // Get paginated collections
            collections: [
              { $sort: sortStage },
              { $skip: skip },
              { $limit: limit },
              // Lookup brand information
              {
                $lookup: {
                  from: 'brands',
                  localField: 'brandId',
                  foreignField: '_id',
                  as: 'brand',
                },
              },
              {
                $unwind: {
                  path: '$brand',
                  preserveNullAndEmptyArrays: true,
                },
              },
              // Lookup model information
              {
                $lookup: {
                  from: 'models',
                  localField: 'modelId',
                  foreignField: '_id',
                  as: 'model',
                },
              },
              {
                $unwind: {
                  path: '$model',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  primaryImage: 1,
                  images: 1,
                  priceStatus: 1,
                  isArchived: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  brand: 1,
                  model: 1,
                  __v: 1,
                },
              },
            ],
            // Get metadata (totals and averages)
            metadata: [
              {
                $group: {
                  _id: null,
                  totalBags: { $sum: 1 },
                  totalValue: { $sum: '$priceStatus.currentValue' },
                  averageValue: { $avg: '$priceStatus.currentValue' },
                },
              },
            ],
          },
        },
      ]);

      const data = result.collections || [];
      const metaData = result.metadata[0];
      const totalPages = Math.ceil(metaData.totalBags / limit);
      // Calculate showing range
      const from = metaData.totalBags === 0 ? 0 : skip + 1;
      const to = Math.min(skip + limit, metaData.totalBags);
      const showing = `Showing ${from} to ${to} of ${metaData.totalBags} results`;
      const isAdmin = user.role === 'admin';
      const basePath = isAdmin ? '/admin/collections' : '/collections';
      const actions: TCollectionsActions = {
        create: isAdmin
          ? undefined
          : {
              href: `${basePath}`,
              method: 'POST',
            },
        update:
          isAdmin && data.length > 0
            ? undefined
            : {
                href: `${basePath}/:id`,
                method: 'PUT',
              },
        delete: {
          href: `${basePath}/:id`,
          method: 'DELETE',
        },
      };

      if (data.length === 0) {
        return {
          data,
          meta: {
            total,
            page,
            limit,
            totalPages,
            links: null,
            actions,
            showing,
          },
        };
      }
      /**
       * TODO
       * [ ] return response implentation
       */
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Update Collection Service'
      );
    }
  }
}
