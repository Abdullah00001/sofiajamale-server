import { Types } from 'mongoose';

import { TAdminBagPriceStatus } from '@/modules/adminBag/adminBag.types';
import { TActionLink } from '@/modules/brand/brand.types';

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
  waitingTimeInDays?: number | null;
  notes?: string | null;
  receipt?: string | null;
  isArchived: boolean;
  __v?: number;
}

export type TFileInfo = {
  filePath: string;
  mimeType: string;
  key: string;
};

type TSkipStage = { $skip: number };
type TLimitStage = { $limit: number };

export type TSkipAndLimitPipelineStage = TSkipStage | TLimitStage;

export type TCollectionsActions = {
  create?: TActionLink;
  update?: TActionLink;
  delete?: TActionLink;
  getOne?:TActionLink;
};


export type TGetModelResponse = {
  data: IModel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    links: TPaginationLinks | null;
    actions?: TBrandActions;
    showing: string;
  };
};