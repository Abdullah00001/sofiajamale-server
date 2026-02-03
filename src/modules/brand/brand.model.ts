import { Schema, Model, model } from 'mongoose';

import User from '@/modules/auth/auth.model';
import { IBrand } from '@/modules/brand/brand.types';

const BrandSchema = new Schema<IBrand>(
  {
    brandLogo: { type: String, default: null },
    brandName: { type: String, minLength: 4, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: User, required: true },
  },
  { timestamps: true }
);

const Brand: Model<IBrand> = model<IBrand>('Brand', BrandSchema);

export default Brand;
