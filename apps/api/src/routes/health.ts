import { type Router as RouterType, Router } from 'express';

export const healthRouter: RouterType = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
