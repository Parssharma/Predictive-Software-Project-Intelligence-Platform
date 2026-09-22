import { type Router as RouterType, Router } from 'express';
import { PrismaClient } from '@ppi/db';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserInstallations,
  getInstallationRepos,
  getRepoMilestones,
} from '../lib/github.js';

const prisma = new PrismaClient();

export const githubRouter: RouterType = Router();

/**
 * GET /github/installations
 * Lists the user's GitHub App installations with their accessible repositories.
 */
githubRouter.get('/github/installations', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { accessToken: true },
    });

    if (!user?.accessToken) {
      res.status(401).json({ error: 'No access token found. Please re-authenticate.' });
      return;
    }

    const installations = await getUserInstallations(user.accessToken);

    // For each installation, fetch its repos
    const installationsWithRepos = await Promise.all(
      installations.map(async (inst) => {
        const repos = await getInstallationRepos(inst.githubId, user.accessToken!);
        return { ...inst, repositories: repos };
      }),
    );

    res.json({ installations: installationsWithRepos });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch installations';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /github/repos/:owner/:repo/milestones
 * Lists milestones for a specific repository.
 */
githubRouter.get('/github/repos/:owner/:repo/milestones', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { accessToken: true },
    });

    if (!user?.accessToken) {
      res.status(401).json({ error: 'No access token found. Please re-authenticate.' });
      return;
    }

    const { owner, repo } = req.params as { owner: string; repo: string };
    const milestones = await getRepoMilestones(owner, repo, user.accessToken);

    res.json({ milestones });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch milestones';
    res.status(500).json({ error: message });
  }
});
