import PgBoss from 'pg-boss';
import pino from 'pino';
import { SAMPLE_JOB_NAME, handleSampleJob } from './jobs/sample.js';
import type { SampleJobData } from './jobs/sample.js';

const logger = pino({ transport: { target: 'pino-pretty' } });

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  logger.error('DATABASE_URL is required');
  process.exit(1);
}

const boss = new PgBoss(databaseUrl);

async function start(): Promise<void> {
  boss.on('error', (error) => logger.error(error, 'pg-boss error'));

  await boss.start();
  logger.info('pg-boss started');

  await boss.work<SampleJobData>(SAMPLE_JOB_NAME, handleSampleJob);
  logger.info(`Registered handler for job: ${SAMPLE_JOB_NAME}`);

  // Send a sample job to demonstrate it works
  const jobId = await boss.send(SAMPLE_JOB_NAME, { message: 'Hello from worker!' });
  logger.info({ jobId }, 'Sent sample job');
}

start().catch((err) => {
  logger.error(err, 'Failed to start worker');
  process.exit(1);
});

export { boss };
