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
  TPutUserCollection,
} from '@/modules/userBag/userBag.schemas';
import {
  IUserBag,
  TCollectionsActions,
  TFileInfo,
  TGetCollectionsResponse,
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
    requestUpdateData,
  }: {
    user: IUser;
    collection: IUserBag;
    requestUpdateData: TPatchUserCollection;
  }): Promise<IUserBag> {
    const { deletedImages, updatedData } =
      requestUpdateData as TPatchUserCollection;
    let images = [...collection.images];
    const newUpdatedData: Partial<IUserBag> = {
      ...(updatedData as Partial<IUserBag>),
    };
    try {
      if (
        deletedImages &&
        deletedImages?.deletedImagesUrls &&
        deletedImages?.deletedImagesUrls.length > 0
      ) {
        images = images.filter(
          (url) => !deletedImages?.deletedImagesUrls.includes(url)
        );
        const deletedImagesKeys = deletedImages?.deletedImagesUrls.map((url) =>
          this.systemUtils.extractS3KeyFromUrl(url)
        );
        await Promise.all(
          deletedImagesKeys.map((key) => this.s3Utils.singleDelete({ key }))
        );
        newUpdatedData.images = images;
      }
      const data = await UserCollection.findOneAndUpdate(
        {
          _id: collection._id,
          userId: user._id,
        },
        { $set: { ...newUpdatedData } },
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

  async updateCollection({
    collection,
    user,
    reqData,
    bagImages,
    primaryImage,
    receiptImage,
  }: {
    user: IUser;
    collection: IUserBag;
    reqData: TPutUserCollection;
    primaryImage?: Express.Multer.File;
    receiptImage?: Express.Multer.File;
    bagImages?: Express.Multer.File[];
  }): Promise<IUserBag> {
    const newImages: {
      primaryImageFileInfo?: TFileInfo;
      receiptImageFile?: TFileInfo;
      bagImagesFileInfos?: TFileInfo[];
    } = {};
    const { updatedData, deletedImages } = reqData as TPutUserCollection;
    let images = [...collection.images];
    if (primaryImage) {
      newImages.primaryImageFileInfo = {
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
      newImages.receiptImageFile = {
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
      newImages.bagImagesFileInfos = bagImages.map((file) => ({
        filePath: join(__dirname, '../../../public/temp', file.filename),
        mimeType: extname(file.originalname),
        key: `user-collections/bag-image/${uuidv4()}/${Date.now()}${extname(file.originalname)}`,
      }));
    }
    const newUpdatedData: Partial<IUserBag> = {
      ...(updatedData as Partial<IUserBag>),
    };
    try {
      if (
        deletedImages &&
        deletedImages?.deletedImagesUrls &&
        deletedImages?.deletedImagesUrls.length > 0
      ) {
        images = images.filter(
          (url) => !deletedImages?.deletedImagesUrls.includes(url)
        );
        const deletedImagesKeys = deletedImages?.deletedImagesUrls.map((url) =>
          this.systemUtils.extractS3KeyFromUrl(url)
        );
        await Promise.all(
          deletedImagesKeys.map((key) => this.s3Utils.singleDelete({ key }))
        );
        newUpdatedData.images = images;
      }
      if (primaryImage && newImages.primaryImageFileInfo) {
        const url = await this.s3Utils.singleUpload(
          newImages.primaryImageFileInfo
        );
        newUpdatedData.primaryImage = url;
        const oldPrimaryImageKey = this.systemUtils.extractS3KeyFromUrl(
          collection.primaryImage
        );
        await this.s3Utils.singleDelete({ key: oldPrimaryImageKey });
      }
      if (receiptImage && newImages.receiptImageFile) {
        const url = await this.s3Utils.singleUpload(newImages.receiptImageFile);
        newUpdatedData.receipt = url;
        if (collection?.receipt) {
          const oldReceiptImage = this.systemUtils.extractS3KeyFromUrl(
            collection.receipt
          );
          await this.s3Utils.singleDelete({ key: oldReceiptImage });
        }
      }
      if (bagImages && bagImages.length > 0 && newImages.bagImagesFileInfos) {
        const urls = await Promise.all(
          newImages?.bagImagesFileInfos.map((fileInfo) =>
            this.s3Utils.singleUpload(fileInfo)
          )
        );
        images = [...images, ...urls];
        newUpdatedData.images = images;
      }

      // changedData.images=
      const data = await UserCollection.findOneAndUpdate(
        {
          _id: collection._id,
          userId: user._id,
        },
        { $set: { ...newUpdatedData } },
        { new: true }
      );
      if (!data)
        throw new Error('Something went wrong while updating the collection');
      return data;
    } catch (error) {
      if (primaryImage && newImages.primaryImageFileInfo) {
        await this.s3Utils.singleDelete({
          key: newImages.primaryImageFileInfo?.key,
        });
      }
      if (receiptImage && newImages.receiptImageFile) {
        await this.s3Utils.singleDelete({
          key: newImages.receiptImageFile.key,
        });
      }
      if (bagImages && bagImages?.length > 0 && newImages.bagImagesFileInfos) {
        await Promise.all(
          newImages.bagImagesFileInfos.map(({ key }) =>
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
  }): Promise<TGetCollectionsResponse> {
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

      // Handle value range - ensure min <= max
      if (valueRangeMin !== undefined || valueRangeMax !== undefined) {
        matchStage['priceStatus.currentValue'] = {};
        if (valueRangeMin !== undefined) {
          matchStage['priceStatus.currentValue'].$gte = valueRangeMin;
        }
        if (valueRangeMax !== undefined) {
          matchStage['priceStatus.currentValue'].$lte = valueRangeMax;
        }
      }

      // Build sort stage
      const sortStage: Record<string, 1 | -1> = {};

      if (sortByCreatedAt) {
        sortStage.createdAt = sortByCreatedAt as 1 | -1;
      }

      if (sortByTrending) {
        // Sort by trend field inside priceStatus
        // 'up' should show 'up' trends first, 'down' should show 'down' trends first
        if (sortByTrending === 'up') {
          // For 'up': prioritize 'up' trend over 'down' (descending alphabetically)
          sortStage['priceStatus.trend'] = -1; // 'up' comes before 'down'
          sortStage['priceStatus.changePercentage'] = -1; // Higher percentages first
        } else {
          // For 'down': prioritize 'down' trend over 'up' (ascending alphabetically)
          sortStage['priceStatus.trend'] = 1; // 'down' comes before 'up'
          sortStage['priceStatus.changePercentage'] = 1; // Lower (more negative) first
        }
      }

      // Default sort by createdAt descending if no sort specified
      if (Object.keys(sortStage).length === 0) {
        sortStage.createdAt = -1;
      }

      const page = queryPage ?? 1;
      const limit = queryLimit ?? 10;
      const skip = (page - 1) * limit;

      const [result] = await UserCollection.aggregate([
        { $match: matchStage },
        {
          $facet: {
            collections: [
              { $sort: sortStage },
              { $skip: skip },
              { $limit: limit },
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
      const metaData = result.metadata[0] || {
        _id: null,
        totalBags: 0,
        totalValue: 0,
        averageValue: 0,
      };

      const totalPages = Math.ceil(metaData.totalBags / limit) || 0;
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
        update_with_image:
          isAdmin && data.length > 0
            ? undefined
            : {
                href: `${basePath}/:id`,
                method: 'PUT',
              },
        update_only_text:
          isAdmin && data.length > 0
            ? undefined
            : {
                href: `${basePath}/:id`,
                method: 'PATCH',
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
            total: metaData.totalBags,
            totalValue: metaData.totalValue,
            averageValue: metaData.averageValue,
            page,
            limit,
            totalPages,
            links: null,
            actions,
            showing,
          },
        };
      }

      const buildLink = (pageNum: number): string => {
        const params = new URLSearchParams();
        params.set('page', pageNum.toString());
        params.set('limit', limit.toString());

        if (brand) params.set('brand', brand);
        if (latherType) params.set('latherType', latherType);
        if (productionYear)
          params.set('productionYear', productionYear.toString());
        if (purchaseYear) params.set('purchaseYear', purchaseYear.toString());
        if (valueRangeMin !== undefined)
          params.set('valueRangeMin', valueRangeMin.toString());
        if (valueRangeMax !== undefined)
          params.set('valueRangeMax', valueRangeMax.toString());
        if (sortByCreatedAt)
          params.set('sortByCreatedAt', sortByCreatedAt.toString());
        if (sortByTrending) params.set('sortByTrending', sortByTrending);
        if (isArchived !== undefined)
          params.set('isArchived', isArchived.toString());

        return `${basePath}?${params.toString()}`;
      };

      return {
        data,
        meta: {
          total: metaData.totalBags,
          totalValue: metaData.totalValue,
          averageValue: metaData.averageValue,
          page,
          limit,
          totalPages,
          links: {
            first: buildLink(1),
            last: buildLink(totalPages),
            previous: page > 1 ? buildLink(page - 1) : null,
            next: page < totalPages ? buildLink(page + 1) : null,
            current: buildLink(page),
          },
          actions,
          showing,
        },
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Get All Collections Service'
      );
    }
  }

  async deleteOneCollectionByAdmin({
    collection,
  }: {
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
        UserCollection.deleteOne({ _id: collection._id }),
      ]);
      return;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Admin Delete One Collections Service'
      );
    }
  }

  async getAllCollectionsForAdmin({
    user,
    query,
  }: {
    user: JwtPayload;
    query: TCollectionQuery;
  }): Promise<TGetCollectionsResponse> {
    try {
      const { limit: queryLimit, page: queryPage } = query;
      const page = queryPage ?? 1;
      const limit = queryLimit ?? 10;
      const skip = (page - 1) * limit;
      const [result] = await UserCollection.aggregate([
        {
          $facet: {
            collections: [
              { $skip: skip },
              { $limit: limit },
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
                $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
                },
              },
              {
                $unwind: {
                  path: '$user',
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
                  purchasePrice: 1,
                  purchaseDate: 1,
                  'user._id': 1,
                  'user.name': 1,
                  'user.avatar': 1,
                  __v: 1,
                },
              },
            ],
            metadata: [
              {
                $group: {
                  _id: null,
                  totalBags: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);
      const data = result.collections || [];
      const metaData = result.metadata[0] || {
        _id: null,
        totalBags: 0,
      };
      const totalPages = Math.ceil(metaData.totalBags / limit) || 0;
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
        update_with_image:
          isAdmin && data.length > 0
            ? undefined
            : {
                href: `${basePath}/:id`,
                method: 'PUT',
              },
        update_only_text:
          isAdmin && data.length > 0
            ? undefined
            : {
                href: `${basePath}/:id`,
                method: 'PATCH',
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
            total: metaData.totalBags,
            page,
            limit,
            totalPages,
            links: null,
            actions,
            showing,
          },
        };
      }
      const buildLink = (pageNum: number): string => {
        const params = new URLSearchParams();
        params.set('page', pageNum.toString());
        params.set('limit', limit.toString());
        return `${basePath}?${params.toString()}`;
      };
      return {
        data,
        meta: {
          total: metaData.totalBags,
          page,
          limit,
          totalPages,
          links: {
            first: buildLink(1),
            last: buildLink(totalPages),
            previous: page > 1 ? buildLink(page - 1) : null,
            next: page < totalPages ? buildLink(page + 1) : null,
            current: buildLink(page),
          },
          actions,
          showing,
        },
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(
        'An Unexpected Error Occurred In Admin Get All Collections Service'
      );
    }
  }
}
