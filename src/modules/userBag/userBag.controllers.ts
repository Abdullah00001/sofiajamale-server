import { Request, Response, RequestHandler } from 'express';
import { injectable } from 'tsyringe';

import { BaseController } from '@/core/base_classes/base.controller';
import { IUser } from '@/modules/auth/auth.types';
import {
  TCollectionQuery,
  TCreateUserCollection,
} from '@/modules/userBag/userBag.schemas';
import { UserBagService } from '@/modules/userBag/userBag.services';

@injectable()
export class UserBagController extends BaseController {
  public createCollection: RequestHandler;
  public deleteCollection: RequestHandler;
  public getCollectionById: RequestHandler;
  public patchCollection: RequestHandler;
  public updateCollection: RequestHandler;
  public getUserCollection: RequestHandler;
  public deleteOneCollectionByAdmin: RequestHandler;
  public getAllCollectionForAdmin: RequestHandler;

  constructor(private readonly userBagService: UserBagService) {
    super();
    this.createCollection = this.wrap(this._createCollection);
    this.deleteCollection = this.wrap(this._deleteCollection);
    this.getCollectionById = this.wrap(this._getCollectionById);
    this.patchCollection = this.wrap(this._patchCollection);
    this.updateCollection = this.wrap(this._updateCollection);
    this.getUserCollection = this.wrap(this._getUserCollection);
    this.deleteOneCollectionByAdmin = this.wrap(
      this._deleteOneCollectionByAdmin
    );
    this.getAllCollectionForAdmin = this.wrap(this._getAllCollectionForAdmin);
  }

  private async _createCollection(req: Request, res: Response): Promise<void> {
    const user = req.user as IUser;
    const collectionData = req.body as TCreateUserCollection;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const primaryImage = files?.primaryImage?.[0];
    const receiptImage = files?.receiptImage?.[0];
    const bagImages = files?.images || [];
    const data = await this.userBagService.createCollection({
      user,
      collectionData,
      primaryImage,
      receiptImage,
      bagImages,
    });
    res.status(201).json({
      success: true,
      status: 201,
      message: 'Collection created successfully',
      data,
    });
    return;
  }

  private async _deleteCollection(req: Request, res: Response): Promise<void> {
    const user = req.user as IUser;
    const collection = req.userBagCollection;
    await this.userBagService.deleteCollection({ user, collection });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection deleted successfully',
    });
    return;
  }

  private async _getCollectionById(req: Request, res: Response): Promise<void> {
    const collection = req.userBagCollection;
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection retrieved successfully',
      data: collection,
    });
    return;
  }

  private async _patchCollection(req: Request, res: Response): Promise<void> {
    const user = req.user as IUser;
    const collection = req.userBagCollection;
    const requestUpdateData = req.body;
    const data = await this.userBagService.patchCollection({
      user,
      collection,
      requestUpdateData,
    });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection updated successfully',
      data,
    });
    return;
  }

  private async _updateCollection(req: Request, res: Response): Promise<void> {
    const user = req.user as IUser;
    const collection = req.userBagCollection;
    const reqData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const primaryImage = files?.primaryImage?.[0];
    const receiptImage = files?.receiptImage?.[0];
    const bagImages = files?.images || [];
    const data = await this.userBagService.updateCollection({
      user,
      collection,
      reqData,
      primaryImage,
      receiptImage,
      bagImages,
    });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection updated successfully',
      data,
    });
    return;
  }

  private async _getUserCollection(req: Request, res: Response): Promise<void> {
    const user = req.user as IUser;
    const query = req.validatedQuery as TCollectionQuery;
    const data = await this.userBagService.getAllCollections({ query, user });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection retrieved successfully',
      ...data,
    });
    return;
  }

  private async _deleteOneCollectionByAdmin(
    req: Request,
    res: Response
  ): Promise<void> {
    const collection = req.userBagCollection;
    await this.userBagService.deleteOneCollectionByAdmin({ collection });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection deleted successfully',
    });
    return;
  }

  private async _getAllCollectionForAdmin(
    req: Request,
    res: Response
  ): Promise<void> {
    const user = req.user;
    const query = req.validatedQuery as TCollectionQuery;
    const data = await this.userBagService.getAllCollectionsForAdmin({
      user,
      query,
    });
    res.status(200).json({
      success: true,
      status: 200,
      message: 'Collection retrieved successfully',
      ...data,
    });
    return;
  }
}
