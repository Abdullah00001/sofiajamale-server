import { injectable } from 'tsyringe';

@injectable()
export class SendEmail {
  async sendSignupOtpEmail(): Promise<void> {}
  async sendAccountVerificationSuccessEmail(): Promise<void> {}
  async sendRecoverAccountOtpEmail(): Promise<void> {}
  async sendRecoverAccountSuccessEmail(): Promise<void> {}
}
