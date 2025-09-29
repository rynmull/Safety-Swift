import { describe, expect, it } from 'vitest';
import { appRouter } from '../src/router';

describe('appRouter', () => {
  it('returns ok for health check', async () => {
    const caller = appRouter.createCaller({ prisma: {} as never });
    const result = await caller.health();
    expect(result).toEqual({ status: 'ok' });
  });

  it('echoes back messages', async () => {
    const caller = appRouter.createCaller({ prisma: {} as never });
    const response = await caller.echo({ message: 'hello' });
    expect(response).toEqual({ message: 'hello' });
  });
});
