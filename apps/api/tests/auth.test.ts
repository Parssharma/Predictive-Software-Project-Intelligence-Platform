import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../src/lib/jwt.js';

describe('JWT Lib', () => {
  it('signs and verifies JWT tokens correctly', () => {
    const payload = { userId: 'user-uuid-123', githubId: 998877 };
    const token = signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.githubId).toBe(payload.githubId);
  });

  it('returns null for invalid or garbage tokens', () => {
    const decoded = verifyToken('invalid.garbage.token');
    expect(decoded).toBeNull();
  });
});
