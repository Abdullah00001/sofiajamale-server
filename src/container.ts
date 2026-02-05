import 'reflect-metadata';

// AUTO-IMPORTS (DO NOT REMOVE)
import { registerUserModule } from '@/modules/user/user.container'
import { registerAuthModule } from '@/modules/auth/auth.container';
import { registerBlogModule } from '@/modules/blog/blog.container';
import { registerBrandModule } from '@/modules/brand/brand.container';
import { registerLegalModule } from '@/modules/legal/legal.container';
import { registerProfileModule } from '@/modules/profile/profile.container';
import { registerUtilsModule } from '@/utils/container';

export const registerContainers = (): void => {
  // AUTO-REGISTER (DO NOT REMOVE)
  registerUtilsModule();
  registerUserModule()
  registerLegalModule()
  registerProfileModule();
  registerAuthModule();
  registerBlogModule();
  registerBrandModule();
};

export default registerContainers;
