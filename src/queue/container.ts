import { container } from 'tsyringe';

import { QUEUE_TOKEN } from '@/core/tokens/queue.token';
import { WORKER_TOKEN } from '@/core/tokens/worker.token';
import { EmailQueue } from '@/queue/queues/email.queue';
import { EmailWorker } from '@/queue/workers/email.worker';

container.register(QUEUE_TOKEN, { useClass: EmailQueue });
container.register(WORKER_TOKEN, {
  useClass: EmailWorker,
});
