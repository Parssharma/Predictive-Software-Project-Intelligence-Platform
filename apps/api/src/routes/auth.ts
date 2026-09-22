import { type Router as RouterType, Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@ppi/db';
import { env } from '../env.js';
import { exchangeCodeForToken, getAuthenticatedUser } from '../lib/github.js';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const authRouter: RouterType = Router();

/**
 * GET /auth/github
 * Returns the GitHub OAuth authorization URL for the frontend to redirect to.
 */
authRouter.get('/auth/github', (_req, res) => {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.FRONTEND_URL}/auth/callback`,
    scope: '',
  });
  res.json({
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
  });
});

const callbackSchema = z.object({
  code: z.string().min(1),
});

/**
 * POST /auth/github/callback
 * Exchanges an OAuth code for a token, fetches user info, upserts User, returns JWT.
 */
authRouter.post('/auth/github/callback', async (req, res) => {
  const parsed = callbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Missing or invalid code', details: parsed.error.flatten() });
    return;
  }

  try {
    const accessToken = await exchangeCodeForToken(parsed.data.code);
    const ghUser = await getAuthenticatedUser(accessToken);

    const user = await prisma.user.upsert({
      where: { githubId: ghUser.githubId },
      update: {
        login: ghUser.login,
        avatarUrl: ghUser.avatarUrl,
        accessToken,
      },
      create: {
        githubId: ghUser.githubId,
        login: ghUser.login,
        avatarUrl: ghUser.avatarUrl,
        accessToken,
      },
    });

    const token = signToken({ userId: user.id, githubId: user.githubId });

    res.cookie('ppi_token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      user: {
        id: user.id,
        login: user.login,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth callback failed';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /auth/me
 * Returns the currently authenticated user's info.
 */
authRouter.get('/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, login: true, avatarUrl: true, githubId: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /auth/logout
 * Clears the JWT cookie.
 */
authRouter.post('/auth/logout', (_req, res) => {
  res.clearCookie('ppi_token', { path: '/' });
  res.json({ success: true });
});
