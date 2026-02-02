import { container } from 'tsyringe';

import { CookieUtils } from '@/utils/cookie.utils';
import { JwtUtils } from '@/utils/jwt.utils';
import { OtpUtils } from '@/utils/otp.utils';
import { PasswordUtils } from '@/utils/password.utils';
import { SendEmail } from '@/utils/sendEmail.utils';
import { SystemUtils } from '@/utils/system.utils';
import { S3Utils } from '@/utils/s3.utils';

/**
 * Utils container
 * Register all utility-level singletons here
 */

export const registerUtilsModule = () => {
  container.registerSingleton(CookieUtils);
  container.registerSingleton(OtpUtils);
  container.registerSingleton(PasswordUtils);
  container.registerSingleton(JwtUtils);
  container.registerSingleton(SendEmail);
  container.registerSingleton(SystemUtils);
  container.registerSingleton(S3Utils);
};
