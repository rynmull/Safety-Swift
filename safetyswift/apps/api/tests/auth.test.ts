import express from 'express';
import request from 'supertest';
import argon2 from 'argon2';
import { OrgRole } from '@prisma/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { AuthenticatedUser } from '../src/auth';

let app: express.Express;
let prismaClient: typeof import('../src/prisma').prisma;
let authenticate: typeof import('../src/auth').authenticate;
let requireOrgRole: typeof import('../src/auth').requireOrgRole;
let signToken: typeof import('../src/auth').signToken;

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/safetyswift';
  process.env.MINIO_ENDPOINT = 'test';
  process.env.MINIO_ACCESS_KEY = 'test';
  process.env.MINIO_SECRET_KEY = 'test';
  process.env.MINIO_BUCKET = 'test';
  process.env.JWT_SECRET = 'test-secret';
  process.env.MAIL_HOST = 'mail.test';
  process.env.MAIL_PORT = '1025';
  process.env.DEFAULT_LOCALE = 'en';
  process.env.NODE_ENV = 'test';

  const indexModule = await import('../src/index');
  app = indexModule.app;

  const prismaModule = await import('../src/prisma');
  prismaClient = prismaModule.prisma;

  const authModule = await import('../src/auth');
  authenticate = authModule.authenticate;
  requireOrgRole = authModule.requireOrgRole;
  signToken = authModule.signToken;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /auth/register', () => {
  it('creates a user, org, and membership', async () => {
    const now = new Date();

    const findUniqueSpy = vi
      .spyOn(prismaClient.user, 'findUnique')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'user-1',
        email: 'new@example.com',
        password: 'hashed',
        name: 'New User',
        locale: 'en',
        createdAt: now,
        updatedAt: now,
        orgs: [
          {
            id: 'orguser-1',
            orgId: 'org-1',
            userId: 'user-1',
            role: OrgRole.OWNER,
            org: {
              id: 'org-1',
              name: 'Acme Builders',
              createdAt: now,
              updatedAt: now
            }
          }
        ]
      } as unknown as AuthenticatedUser & { password: string });

    const orgCreateSpy = vi.spyOn(prismaClient.org, 'create').mockResolvedValue({
      id: 'org-1',
      name: 'Acme Builders',
      createdAt: now,
      updatedAt: now
    });

    const userCreateSpy = vi.spyOn(prismaClient.user, 'create').mockResolvedValue({
      id: 'user-1',
      email: 'new@example.com',
      password: 'hashed',
      name: 'New User',
      locale: 'en',
      createdAt: now,
      updatedAt: now
    });

    const orgUserCreateSpy = vi.spyOn(prismaClient.orgUser, 'create').mockResolvedValue({
      id: 'orguser-1',
      orgId: 'org-1',
      userId: 'user-1',
      role: OrgRole.OWNER
    });

    const response = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      password: 'Password123!',
      name: 'New User',
      orgName: 'Acme Builders'
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('new@example.com');
    expect(response.body.org).toEqual({
      id: 'org-1',
      name: 'Acme Builders',
      role: 'OWNER'
    });

    expect(findUniqueSpy).toHaveBeenCalledTimes(2);
    expect(orgCreateSpy).toHaveBeenCalled();
    expect(userCreateSpy).toHaveBeenCalled();
    expect(orgUserCreateSpy).toHaveBeenCalled();
  });
});

describe('POST /auth/login', () => {
  it('returns a token and user data for valid credentials', async () => {
    const hashedPassword = await argon2.hash('Password123!');
    const now = new Date();

    vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValue({
      id: 'user-1',
      email: 'owner@acme.test',
      password: hashedPassword,
      name: 'Owner',
      locale: 'en',
      createdAt: now,
      updatedAt: now,
      orgs: [
        {
          id: 'orguser-1',
          orgId: 'org-1',
          userId: 'user-1',
          role: OrgRole.OWNER,
          org: {
            id: 'org-1',
            name: 'Acme Builders',
            createdAt: now,
            updatedAt: now
          }
        }
      ]
    } as unknown as AuthenticatedUser & { password: string });

    const response = await request(app).post('/auth/login').send({
      email: 'owner@acme.test',
      password: 'Password123!'
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.user.email).toBe('owner@acme.test');
    expect(response.body.user.orgs[0]).toMatchObject({
      id: 'org-1',
      name: 'Acme Builders',
      role: 'OWNER'
    });
  });

  it('rejects invalid credentials', async () => {
    const hashedPassword = await argon2.hash('AnotherPassword!');
    const now = new Date();

    vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValue({
      id: 'user-1',
      email: 'owner@acme.test',
      password: hashedPassword,
      name: 'Owner',
      locale: 'en',
      createdAt: now,
      updatedAt: now,
      orgs: []
    } as unknown as AuthenticatedUser & { password: string });

    const response = await request(app).post('/auth/login').send({
      email: 'owner@acme.test',
      password: 'Password123!'
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });
});

describe('auth middleware', () => {
  it('allows access when the user has sufficient role', async () => {
    const protectedApp = express();
    protectedApp.get(
      '/orgs/:orgId/protected',
      authenticate,
      requireOrgRole(OrgRole.MANAGER),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    const now = new Date();

    vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValue({
      id: 'user-1',
      email: 'owner@acme.test',
      password: 'hashed',
      name: 'Owner',
      locale: 'en',
      createdAt: now,
      updatedAt: now,
      orgs: [
        {
          id: 'orguser-1',
          orgId: 'org-1',
          userId: 'user-1',
          role: OrgRole.OWNER,
          org: {
            id: 'org-1',
            name: 'Acme Builders',
            createdAt: now,
            updatedAt: now
          }
        }
      ]
    } as unknown as AuthenticatedUser & { password: string });

    const token = signToken('user-1');

    const response = await request(protectedApp)
      .get('/orgs/org-1/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('rejects when the user lacks the required role', async () => {
    const protectedApp = express();
    protectedApp.get(
      '/orgs/:orgId/protected',
      authenticate,
      requireOrgRole(OrgRole.MANAGER),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    const now = new Date();

    vi.spyOn(prismaClient.user, 'findUnique').mockResolvedValue({
      id: 'user-2',
      email: 'worker@acme.test',
      password: 'hashed',
      name: 'Worker',
      locale: 'en',
      createdAt: now,
      updatedAt: now,
      orgs: [
        {
          id: 'orguser-2',
          orgId: 'org-1',
          userId: 'user-2',
          role: OrgRole.WORKER,
          org: {
            id: 'org-1',
            name: 'Acme Builders',
            createdAt: now,
            updatedAt: now
          }
        }
      ]
    } as unknown as AuthenticatedUser & { password: string });

    const token = signToken('user-2');

    const response = await request(protectedApp)
      .get('/orgs/org-1/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden');
  });
});
