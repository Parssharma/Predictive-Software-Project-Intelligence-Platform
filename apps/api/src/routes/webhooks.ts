import { type Router as RouterType, Router } from 'express';
import crypto from 'node:crypto';
import { PrismaClient } from '@ppi/db';
import { env } from '../env.js';
import pino from 'pino';

const prisma = new PrismaClient();
const logger = pino({ transport: { target: 'pino-pretty' } });

export const webhookRouter: RouterType = Router();

/**
 * Verify GitHub webhook HMAC-SHA256 signature.
 */
function verifyWebhookSignature(payload: string, signature: string | undefined): boolean {
  if (!signature) return false;

  const expected = `sha256=${crypto
    .createHmac('sha256', env.GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * POST /webhooks/github
 * Handles GitHub App webhook events (installation created/deleted).
 * Uses raw body for signature verification.
 */
webhookRouter.post(
  '/webhooks/github',
  // Need raw body for HMAC — use express.raw for this route
  async (req, res) => {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const event = req.headers['x-github-event'] as string | undefined;
    const deliveryId = req.headers['x-github-delivery'] as string | undefined;

    // Get raw body as string for signature verification
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Webhook signature verification failed');
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    if (!deliveryId) {
      res.status(400).json({ error: 'Missing delivery ID' });
      return;
    }

    logger.info({ event, deliveryId }, 'Received webhook');

    const body = typeof req.body === 'string' ? JSON.parse(req.body) as Record<string, unknown> : req.body as Record<string, unknown>;

    try {
      if (event === 'installation') {
        await handleInstallationEvent(body, deliveryId);
      }

      res.json({ received: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Webhook processing failed';
      logger.error({ err, event, deliveryId }, 'Webhook processing error');
      res.status(500).json({ error: message });
    }
  },
);

interface InstallationPayload {
  action: string;
  installation: {
    id: number;
    app_id: number;
  };
  sender: {
    id: number;
    login: string;
  };
}

async function handleInstallationEvent(
  body: Record<string, unknown>,
  _deliveryId: string,
): Promise<void> {
  const payload = body as unknown as InstallationPayload;

  if (payload.action === 'created') {
    // Find the user by GitHub ID (the sender)
    const user = await prisma.user.findUnique({
      where: { githubId: payload.sender.id },
    });

    if (user) {
      await prisma.installation.upsert({
        where: { githubId: payload.installation.id },
        update: {},
        create: {
          githubId: payload.installation.id,
          userId: user.id,
        },
      });
      logger.info(
        { installationId: payload.installation.id, userId: user.id },
        'Installation created',
      );
    } else {
      logger.warn(
        { senderId: payload.sender.id },
        'Installation webhook from unknown user',
      );
    }
  } else if (payload.action === 'deleted') {
    await prisma.installation
      .delete({ where: { githubId: payload.installation.id } })
      .catch(() => {
        // Installation may not exist in our DB
      });
    logger.info({ installationId: payload.installation.id }, 'Installation deleted');
  }
}
