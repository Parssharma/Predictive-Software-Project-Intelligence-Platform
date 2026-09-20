import { describe, it, expect } from 'vitest';
import { SAMPLE_JOB_NAME, handleSampleJob } from '../src/jobs/sample.js';

describe('sample job', () => {
  it('has a valid job name', () => {
    expect(SAMPLE_JOB_NAME).toBe('sample-job');
  });

  it('handler completes without error', async () => {
    const mockJobs = [
      {
        id: 'test-id',
        name: SAMPLE_JOB_NAME,
        data: { message: 'test' },
      },
    ];
    // Should not throw
    await expect(
      handleSampleJob(mockJobs as unknown as Parameters<typeof handleSampleJob>[0]),
    ).resolves.toBeUndefined();
  });
});
