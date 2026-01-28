import { Router } from 'express'
import { container } from 'tsyringe'

import { AuthController } from '@/module/auth/auth.controllers'
import { AuthMiddleware } from '@/module/auth/auth.middlewares'

const router = Router()

const controller = container.resolve(AuthController)
const middleware = container.resolve(AuthMiddleware)

router.get('/', middleware.handle, controller.example)

export default router