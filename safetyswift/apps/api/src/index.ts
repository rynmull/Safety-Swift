import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import argon2 from 'argon2';
import { z } from 'zod';
import { OrgRole } from '@prisma/client';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { env } from './env';
import { appRouter } from './router';
import { createContext } from './trpc/context';
import { prisma } from './prisma';
import { authenticate, loadUserByEmail, loadUserWithMemberships, serializeUser, signToken } from './auth';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
  orgName: z.string().min(2),
  locale: z.enum(['en', 'es']).optional()
});

app.post('/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    });
  }

  const { email, password, name, orgName, locale } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await argon2.hash(password);

  const org = await prisma.org.create({
    data: {
      name: orgName
    }
  });

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name,
      locale: locale ?? env.DEFAULT_LOCALE
    }
  });

  await prisma.orgUser.create({
    data: {
      orgId: org.id,
      userId: user.id,
      role: OrgRole.OWNER
    }
  });

  const userWithMemberships = await loadUserWithMemberships(user.id);

  if (!userWithMemberships) {
    return res.status(500).json({ error: 'Unable to load user after registration' });
  }

  return res.status(201).json({
    user: userWithMemberships,
    org: {
      id: org.id,
      name: org.name,
      role: OrgRole.OWNER
    }
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

app.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten()
    });
  }

  const { email, password } = parsed.data;
  const user = await loadUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await argon2.verify(user.password, password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id);

  return res.json({
    token,
    user: serializeUser(user)
  });
});

app.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
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
export { requireOrgRole } from './auth';
