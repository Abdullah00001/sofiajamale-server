// queue/queues/email.queue.ts

import { injectable } from 'tsyringe';

import { BaseQueue } from '@/core/base_classes/queue.base';
import { TSignupUserVerifyOtpEmailData } from '@/types/emailQueue.types';

@injectable()
export class EmailQueue extends BaseQueue {
  constructor() {
    super('email-queue');
  }

  async sendSignupVerificationOtpEmail(
    data: TSignupUserVerifyOtpEmailData
  ): Promise<void> {
    await this.queue.add('send-signup-user-verify-otp-email', data);
  }
}
