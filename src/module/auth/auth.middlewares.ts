import { Request, Response, NextFunction } from 'express'
import { injectable } from 'tsyringe'

@injectable()
export class AuthMiddleware {
  handle = (
    _req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    next()
  }
}