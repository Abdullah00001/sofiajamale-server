import { container } from 'tsyringe'

import { AuthController } from '@/module/auth/auth.controllers'
import { AuthMiddleware } from '@/module/auth/auth.middlewares'
import { AuthService } from '@/module/auth/auth.services'

export const registerAuthModule = (): void => {
  container.registerSingleton(AuthService)
  container.registerSingleton(AuthController)
  container.registerSingleton(AuthMiddleware)
}