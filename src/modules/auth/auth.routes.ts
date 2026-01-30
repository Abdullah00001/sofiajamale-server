import { Router } from 'express';
import { container } from 'tsyringe';

import { validateReqBody } from '@/middlewares/validateReqBody.middleware';
import { AuthController } from '@/modules/auth/auth.controllers';
import { AuthMiddleware } from '@/modules/auth/auth.middlewares';
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
} from '@/modules/auth/auth.schemas';

const router = Router();

const controller = container.resolve(AuthController);
const middleware = container.resolve(AuthMiddleware);

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

router.post(
  '/auth/login',
  validateReqBody(loginSchema),
  middleware.checkLoginUserExist,
  middleware.checkPassword,
  controller.login
);

export default router;
