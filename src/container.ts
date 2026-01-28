import 'reflect-metadata';

// AUTO-IMPORTS (DO NOT REMOVE)
import { registerAuthModule } from '@/module/auth/auth.container'

export const registerContainers = (): void => {
  // AUTO-REGISTER (DO NOT REMOVE)
  registerAuthModule()
};

export default registerContainers;
