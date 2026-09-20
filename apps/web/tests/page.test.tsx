import { describe, it, expect } from 'vitest';

describe('Home page', () => {
  it('module can be imported', async () => {
    // Basic smoke test: the page module should be importable
    // Full rendering tests require Next.js test setup (Phase 8+)
    const mod = await import('../src/app/page');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});
