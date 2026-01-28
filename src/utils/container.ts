import { container } from 'tsyringe';

import { env } from '@/env';
import { CookieUtils } from '@/utils/cookie.utils';
import { JwtUtils } from '@/utils/jwt.utils';
import { OTP_SECRET_TOKEN } from '@/utils/otp.utils';
import { PasswordUtils } from '@/utils/password.utils';

/**
 * Utils container
 * Register all utility-level singletons here
 */

container.registerSingleton(CookieUtils);

container.register(OTP_SECRET_TOKEN, {
  useValue: env.OTP_HASH_SECRET,
});

container.registerSingleton(PasswordUtils);

container.registerSingleton(JwtUtils);
