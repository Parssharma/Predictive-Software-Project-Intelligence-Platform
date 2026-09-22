import { type Router as RouterType, Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@ppi/db';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const connectRouter: RouterType = Router();

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

/**
 * POST /connect
 * Saves a repository + milestone selection to the database.
 * Creates Installation (if not exists), Repository, and Milestone records.
 */
connectRouter.post('/connect', requireAuth, async (req, res) => {
  const parsed = connectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
    return;
  }

  const { installationGithubId, repository, milestone } = parsed.data;

  try {
    // Upsert Installation
    const installation = await prisma.installation.upsert({
      where: { githubId: installationGithubId },
      update: {},
      create: {
        githubId: installationGithubId,
        userId: req.user!.userId,
      },
    });

    // Upsert Repository
    const repo = await prisma.repository.upsert({
      where: { githubId: repository.githubId },
      update: {
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
      },
      create: {
        githubId: repository.githubId,
        owner: repository.owner,
        name: repository.name,
        fullName: repository.fullName,
        installationId: installation.id,
      },
    });

    // Upsert Milestone
    const ms = await prisma.milestone.upsert({
      where: {
        repositoryId_githubId: {
          repositoryId: repo.id,
          githubId: milestone.githubId,
        },
      },
      update: {
        title: milestone.title,
        description: milestone.description ?? null,
        state: milestone.state,
        dueOn: milestone.dueOn ? new Date(milestone.dueOn) : null,
        closedAt: milestone.closedAt ? new Date(milestone.closedAt) : null,
        githubUpdatedAt: new Date(milestone.updatedAt),
      },
      create: {
        githubId: milestone.githubId,
        repositoryId: repo.id,
        number: milestone.number,
        title: milestone.title,
        description: milestone.description ?? null,
        state: milestone.state,
        dueOn: milestone.dueOn ? new Date(milestone.dueOn) : null,
        closedAt: milestone.closedAt ? new Date(milestone.closedAt) : null,
        githubCreatedAt: new Date(milestone.createdAt),
        githubUpdatedAt: new Date(milestone.updatedAt),
      },
    });

    res.json({
      success: true,
      connection: {
        repositoryId: repo.id,
        repositoryFullName: repo.fullName,
        milestoneId: ms.id,
        milestoneTitle: ms.title,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save connection';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /connections
 * Lists the user's connected repos and milestones.
 */
connectRouter.get('/connections', requireAuth, async (req, res) => {
  try {
    const installations = await prisma.installation.findMany({
      where: { userId: req.user!.userId },
      include: {
        repositories: {
          include: {
            milestones: {
              select: {
                id: true,
                githubId: true,
                number: true,
                title: true,
                state: true,
                dueOn: true,
              },
            },
          },
        },
      },
    });

    const connections = installations.flatMap((inst) =>
      inst.repositories.flatMap((repo) =>
        repo.milestones.map((ms) => ({
          repositoryId: repo.id,
          repositoryFullName: repo.fullName,
          milestoneId: ms.id,
          milestoneNumber: ms.number,
          milestoneTitle: ms.title,
          milestoneState: ms.state,
          milestoneDueOn: ms.dueOn,
        })),
      ),
    );

    res.json({ connections });
  } catch {
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});
