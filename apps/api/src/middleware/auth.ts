import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware that verifies JWT from Authorization header or cookie.
 * Attaches user payload to req.user.
 * Returns 401 if no valid token is found.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Try Authorization header first
  const authHeader = req.headers['authorization'];
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // Fall back to cookie
  if (!token) {
    token = (req.cookies as Record<string, string> | undefined)?.['ppi_token'];
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = payload;
  next();
}
