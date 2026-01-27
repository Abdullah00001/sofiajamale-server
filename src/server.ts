import { createServer, Server } from 'node:http';

import dotenv from 'dotenv';

import app from '@/app';
import connectDatabase  from '@/configs/db.config';
import {connectRedis} from '@/configs/redis.config';
import { shutdown } from '@/utils/index';

const { config } = dotenv;

config();

const port: number = Number(process.env.PORT) || 5000;

const server: Server = createServer(app);

async function main(): Promise<void> {
  await connectDatabase();
  await connectRedis()
  server.listen(port, () => {
    console.log(`Server Running On Port : ${port}`);
  });
}

main();

/**
 * Graceful signals
 */
process.on('SIGINT', () => shutdown({ reason: 'SIGINT', server }));
process.on('SIGTERM', () => shutdown({ reason: 'SIGTERM', server }));

/**
 * Fatal errors
 */
process.on('unhandledRejection', (error) =>
  shutdown({ reason: 'unhandledRejection', server, error })
);

process.on('uncaughtException', (error) =>
  shutdown({ reason: 'uncaughtException', server, error })
);
