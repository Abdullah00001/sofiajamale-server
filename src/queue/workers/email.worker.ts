// queue/workers/email.worker.ts
import { Job } from 'bullmq';
import { injectable } from 'tsyringe';

import { BaseWorker } from '@/core/base_classes/worker.base';
import { TSignupUserVerifyOtpEmailData } from '@/types/emailQueue.types';
import { SendEmail } from '@/utils/sendEmail.utils';

@injectable()
export class EmailWorker extends BaseWorker {
  constructor(private readonly sendEmail: SendEmail) {
    super('email-queue', async (job: Job) => {
      await this.process(job);
    });
  }

  private async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'send-signup-user-verify-otp-email':
        await this.sendEmail.sendSignupUserVerifyOtpEmail(
          job.data as TSignupUserVerifyOtpEmailData
        );
        return;

      default:
        throw new Error(`Unhandled email job: ${job.name}`);
    }
  }
}
