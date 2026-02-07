import { Schema } from 'mongoose';

export enum TrendEnum {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

export type TAdminBagPriceStatus = {
  currentValue: number;
  changePercentage: number;
  trend: TrendEnum;
};

export interface IAdminBags {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  bagBrand: Schema.Types.ObjectId;
  bagModel: Schema.Types.ObjectId;
  images: string[];
  productionYear: Date;
  priceStatus: TAdminBagPriceStatus;
  user: Schema.Types.ObjectId;
}
