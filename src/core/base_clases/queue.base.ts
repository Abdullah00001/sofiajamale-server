// queues/base.queue.ts
import { Queue, QueueOptions } from 'bullmq';

export abstract class BaseQueue {
  protected readonly queue: Queue;

  protected constructor(name: string, options: QueueOptions) {
    this.queue = new Queue(name, options);
  }

  async close(): Promise<void> {
    await this.queue.close();
  }

  get instance(): Queue {
    return this.queue;
  }
}
