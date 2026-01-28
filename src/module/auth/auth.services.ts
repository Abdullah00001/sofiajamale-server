import { injectable } from 'tsyringe'

@injectable()
export class AuthService {
  example(): string {
    return 'Auth service works'
  }
}