import TEnv from '@/types/env.types';
import { getEnv } from '@/utils/index';

export const env: TEnv = {
  DATABASE_URL: getEnv('DATABASE_URL'),
  NODE_ENV: getEnv('NODE_ENV'),
  JWT_ACCESS_TOKEN_SECRET_KEY: getEnv('JWT_ACCESS_TOKEN_SECRET_KEY'),
  JWT_REFRESH_TOKEN_SECRET_KEY: getEnv('JWT_REFRESH_TOKEN_SECRET_KEY'),
  SMTP_HOST: getEnv('SMTP_HOST'),
  SMTP_PORT: Number(getEnv('SMTP_PORT')),
  SMTP_USER: getEnv('SMTP_USER'),
  SMTP_PASS: getEnv('SMTP_PASS'),
  OTP_HASH_SECRET: getEnv('OTP_HASH_SECRET'),
  REDIS_HOST: getEnv('REDIS_HOST'),
  REDIS_PASSWORD: getEnv('REDIS_PASSWORD'),
  REDIS_PORT: Number(getEnv('REDIS_PORT')),
  JWT_VERIFY_OTP_PAGE_SECRET_KEY: getEnv('JWT_VERIFY_OTP_PAGE_SECRET_KEY'),
};
