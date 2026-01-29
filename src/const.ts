export const corsWhiteList = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://amar-contacts.onrender.com',
  'https://amar-contacts-staging-client.onrender.com',
  'https://workly.ink',
  'https://contacts.workly.ink',
  'http://10.0.0.103:3000',
];
export const saltRound = 10;
export const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
export const baseUrl = {
  v1: '/api/v1',
};
export const userAccessTokenExpiresIn = '3d';
export const refreshTokenExpiresIn = '7d';
export const otpExpireAt = 4;
