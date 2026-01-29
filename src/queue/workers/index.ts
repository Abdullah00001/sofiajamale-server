import { container } from 'tsyringe';

import { EmailWorker } from '@/queue/workers/email.worker';

/**
 * Worker bootstrap
 * Importing this file starts all workers
 */

export const startWorkers = (): void => {
  container.resolve(EmailWorker);
};
