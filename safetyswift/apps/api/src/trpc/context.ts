import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '../prisma';

export const createContext = (_opts?: CreateExpressContextOptions) => ({
  prisma
});

export type Context = inferAsyncReturnType<typeof createContext>;
