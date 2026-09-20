import type PgBoss from 'pg-boss';
import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });

export const SAMPLE_JOB_NAME = 'sample-job';

export interface SampleJobData {
  message: string;
}

export async function handleSampleJob(jobs: PgBoss.Job<SampleJobData>[]): Promise<void> {
  for (const job of jobs) {
    logger.info({ jobId: job.id, data: job.data }, 'Processing sample job');
    // No-op: just log and complete
    logger.info({ jobId: job.id }, 'Sample job completed');
  }
}
