import Handlebars from 'handlebars';
import { injectable } from 'tsyringe';

import mailTransporter from '@/configs/nodemailer.config';
import { signupUserVerifyOtpEmailTemplate } from '@/templates/signupUserVerifyOtpEmail.template';
import { TSignupUserVerifyOtpEmailData } from '@/types/emailQueue.types';
import mailOption from '@/utils/mailOption.utils';

@injectable()
export class SendEmail {
  async sendSignupUserVerifyOtpEmail(
    data: TSignupUserVerifyOtpEmailData
  ): Promise<void> {
    try {
      const template = Handlebars.compile(signupUserVerifyOtpEmailTemplate);
      const personalizedTemplate = template(data);
      await mailTransporter.sendMail(
        mailOption(
          data.email,
          'Email Verification Required',
          personalizedTemplate
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(
          'Unknown Error Occurred In Send Account Verification Otp Email Utility'
        );
      }
    }
  }
  async sendAccountVerificationSuccessEmail(): Promise<void> {}
  async sendRecoverAccountOtpEmail(): Promise<void> {}
  async sendRecoverAccountSuccessEmail(): Promise<void> {}
}
