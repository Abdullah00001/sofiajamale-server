import { Schema, model, Model } from 'mongoose';

import { PriceStatusSchema } from '@/modules/adminBag/adminBag.model';
import { IUserBag } from '@/modules/userBag/userBag.types';

const UserCollectionSchema = new Schema<IUserBag>(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true,
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    primaryImage: { type: String, required: true },
    images: [{ type: String }],
    bagColor: { type: String, required: true },
    latherType: { type: String, required: true },
    hardwareColor: { type: String, required: true },
    size: { type: String, required: true },
    priceStatus: PriceStatusSchema,
    productionYear: { type: Number, required: true },
    condition: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    currency: { type: String, required: true },
    purchaseLocation: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    purchaseType: { type: String, required: true },
    waitingTimeInDays: { type: Number, default: null },
    notes: { type: String, default: null },
    receipt: { type: String },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserCollection: Model<IUserBag> = model<IUserBag>(
  'UserCollection',
  UserCollectionSchema
);

export default UserCollection;
