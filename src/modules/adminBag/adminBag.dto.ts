import { Schema } from 'mongoose';

import { BaseDTO } from '@/core/base_classes/dto.base';
import { IAdminBags } from '@/modules/adminBag/adminBag.types';

export class CreateAdminBagDTO extends BaseDTO<IAdminBags> {
  public _id: Schema.Types.ObjectId;
  public bagBrand: Schema.Types.ObjectId;
  public bagModel: Schema.Types.ObjectId;
  public images: string[];
  public productionYear: Date;
  public priceStatus: {
    currentValue: number;
    changePercentage: number;
    trend: string;
  };
  public createdAt: Date;
  public updatedAt: Date;
  constructor(adminBag: IAdminBags) {
    super(adminBag);
    this.bagBrand = adminBag.bagBrand;
    this.bagModel = adminBag.bagModel;
    this.images = adminBag.images;
    this.productionYear = adminBag.productionYear;
    this.priceStatus = adminBag.priceStatus;
    this.createdAt = adminBag.createdAt;
    this.updatedAt = adminBag.updatedAt;
    this._id = adminBag._id;
  }
}
