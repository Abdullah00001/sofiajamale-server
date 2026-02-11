import { model, Model, Schema, Types } from 'mongoose';

import { CURRENCIES } from '@/const';
import {
  IAdminBags,
  TAdminBagPriceStatus,
  TrendEnum,
} from '@/modules/adminBag/adminBag.types';

export const PriceStatusSchema = new Schema<TAdminBagPriceStatus>(
  {
    trend: { type: String, required: true, enum: TrendEnum },
    changePercentage: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    currency: {
      type: String,
      required: true,
      enum: CURRENCIES,
      default: 'EUR',
    },
  },
  { _id: false }
);

const AdminBagSchema = new Schema<IAdminBags>(
  {
    bagBrand: {
      type: Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true,
    },
    bagModel: {
      type: Types.ObjectId,
      ref: 'Model',
      required: true,
      index: true,
    },
    image: { type: String, required: true },
    productionYear: { type: Date, required: true },
    priceStatus: PriceStatusSchema,
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const AdminBag: Model<IAdminBags> = model<IAdminBags>(
  'AdminBag',
  AdminBagSchema
);

export default AdminBag;
