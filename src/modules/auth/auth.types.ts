import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

import { Role } from '@/types/jwt.types';

export enum AccountStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

export interface IUser {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  displayName: string;
  email: string;
  password: string;
  role: Role;
  isVerified: boolean;
  accountStatus: AccountStatus;
  isTermsAndPrivacyAccepted: boolean;
  termsAndPrivacyAcceptedAt: Date;
  location: string;
  avatar: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TVerifyOtp = {
  user: JwtPayload;
};
