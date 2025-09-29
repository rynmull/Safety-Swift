import { z } from 'zod';
import { publicProcedure, router } from '../trpc/trpc';

export const appRouter = router({
  health: publicProcedure.query(() => ({
    status: 'ok' as const
  })),
  echo: publicProcedure
    .input(
      z.object({
        message: z.string().min(1)
      })
    )
    .query(({ input }) => ({
      message: input.message
    }))
});

export type AppRouter = typeof appRouter;
