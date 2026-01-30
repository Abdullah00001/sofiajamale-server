import { Router } from 'express';
import { container } from 'tsyringe';

import { validateReqBody } from '@/middlewares/validateReqBody.middleware';
import { AuthController } from '@/modules/auth/auth.controllers';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import {
  findRecoverUserSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyOtpSchema,
} from '@/modules/auth/auth.schemas';

const router = Router();

const controller = container.resolve(AuthController);
const middleware = container.resolve(AuthMiddleware);

// User Signup Flow
router.post(
  '/auth/signup',
  validateReqBody(signupSchema),
  middleware.checkSignupUserExist,
  controller.signup
);

router.post(
  '/auth/verify',
  validateReqBody(verifyOtpSchema),
  middleware.checkOtpPageToken,
  middleware.checkOtp,
  controller.verifyOtp
);

router.post('/auth/resend', middleware.checkOtpPageToken, controller.resendOtp);

// User Login
router.post(
  '/auth/login',
  validateReqBody(loginSchema),
  middleware.findUserWithEmail,
  middleware.checkPassword,
  controller.login
);

router.post(
  '/auth/check',
  middleware.checkAccessToken,
  controller.checkAccessToken
);

router.post('/auth/logout', middleware.checkAccessToken, controller.logout);

//Admin Login
router.post(
  '/auth/admin/login',
  validateReqBody(loginSchema),
  middleware.findUserWithEmail,
  middleware.checkPassword,
  controller.adminLogin
);

// Recover Flow
router.post(
  '/auth/recover/find',
  validateReqBody(findRecoverUserSchema),
  middleware.findUserWithEmail,
  controller.findRecoverUser
);

router.post(
  '/auth/recover/verify',
  validateReqBody(verifyOtpSchema),
  middleware.checkOtpPageToken,
  middleware.checkOtp,
  controller.recoverUserOtpVerify
);

router.patch(
  '/auth/recover/reset',
  validateReqBody(resetPasswordSchema),
  middleware.checkOtpPageToken,
  controller.recoverResetPassword
);

export default router;
