import { Request, Response } from 'express'
import { injectable } from 'tsyringe'

import { AuthService } from '@/module/auth/auth.services'

@injectable()
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  example = async (_req: Request, res: Response): Promise<void> => {
    const result = this.authService.example()
    res.status(200).json({ result })
  }
}