import { Types } from 'mongoose';

import { TAdminBagPriceStatus } from '@/modules/adminBag/adminBag.types';

export interface IUserBag {
  brandId: Types.ObjectId;
  modelId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
  primaryImage: string;
  images: string[];
  bagColor: string;
  latherType: string;
  hardwareColor: string;
  size: string;
  priceStatus: TAdminBagPriceStatus;
  productionYear: number;
  condition: string;
  purchasePrice: number;
  currency: string;
  purchaseLocation: string;
  purchaseDate: Date;
  purchaseType: string;
  waitingTimeInDays?: number|null;
  notes?: string|null;
  receipt?: string|null;
  isArchived: boolean;
  __v?: number;
}

export type TFileInfo = {
  filePath: string;
  mimeType: string;
  key: string;
};
