import { Schema, model, Model } from 'mongoose';

import { AccountStatus, IUser } from '@/modules/auth/auth.types';
import { Role } from '@/types/jwt.types';

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, minLength: 4 },
    email: { type: String, required: true },
    avatar: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    displayName: { type: String, default: null, minLength: 4 },
    accountStatus: { type: String, default: AccountStatus.ACTIVE },
    termsAndPrivacyAcceptedAt: { type: Date, required: true },
    location: { type: String, default: null },
    isTermsAndPrivacyAccepted: { type: Boolean, required: true },
    password: { type: String, required: true, minLength: 8 },
    role: { type: String, default: Role.USER },
    phone:{type:String,default:null}
  },
  { timestamps: true }
);

const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
