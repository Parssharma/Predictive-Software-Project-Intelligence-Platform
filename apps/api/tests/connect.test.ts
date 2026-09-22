import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const connectSchema = z.object({
  installationGithubId: z.number().int().positive(),
  repository: z.object({
    githubId: z.number().int().positive(),
    owner: z.string().min(1),
    name: z.string().min(1),
    fullName: z.string().min(1),
  }),
  milestone: z.object({
    githubId: z.number().int().positive(),
    number: z.number().int().positive(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    state: z.string().default('open'),
    dueOn: z.string().nullable().optional(),
    closedAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

describe('Connect Request Validation Schema', () => {
  it('validates a complete and valid connect request payload', () => {
    const validPayload = {
      installationGithubId: 1234567,
      repository: {
        githubId: 889900,
        owner: 'my-org',
        name: 'my-repo',
        fullName: 'my-org/my-repo',
      },
      milestone: {
        githubId: 42,
        number: 1,
        title: 'v1.0 MVP Release',
        description: 'First milestone forecast',
        state: 'open',
        dueOn: '2026-12-31T23:59:59Z',
        closedAt: null,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-20T12:00:00Z',
      },
    };

    const result = connectSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects payload missing repository information', () => {
    const invalidPayload = {
      installationGithubId: 1234567,
      milestone: {
        githubId: 42,
        number: 1,
        title: 'v1.0 MVP Release',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-20T12:00:00Z',
      },
    };

    const result = connectSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
