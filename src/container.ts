import 'reflect-metadata';

// AUTO-IMPORTS (DO NOT REMOVE)
import { registerBrandModule } from '@/modules/brand/brand.container'
import { registerAuthModule } from '@/modules/auth/auth.container';
import { registerProfileModule } from '@/modules/profile/profile.container';
import { registerUtilsModule } from '@/utils/container';

export const registerContainers = (): void => {
  // AUTO-REGISTER (DO NOT REMOVE)
  registerBrandModule()
  registerUtilsModule();
  registerProfileModule();
  registerAuthModule();
};

export default registerContainers;
