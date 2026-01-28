// configs/queue.config.ts
import { QueueOptions } from 'bullmq';

import redisClient from '@/configs/redis.config';

export const defaultQueueOptions: QueueOptions = {
  connection: redisClient!,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
};
