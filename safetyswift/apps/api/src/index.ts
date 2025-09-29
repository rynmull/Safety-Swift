import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { env } from './env';
import { appRouter } from './router';
import { createContext } from './trpc/context';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

const port = Number(env.PORT ?? 4000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

export type AppRouter = typeof appRouter;
export { app };
