import 'reflect-metadata';

// AUTO-IMPORTS (DO NOT REMOVE)
import { registerAuthModule } from '@/modules/auth/auth.container';
import {registerUtilsModule} from '@/utils/container'

export const registerContainers = (): void => {
  // AUTO-REGISTER (DO NOT REMOVE)
  registerUtilsModule();
  registerAuthModule();
};

export default registerContainers;
