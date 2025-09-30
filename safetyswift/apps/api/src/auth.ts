import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Org, OrgUser, User } from '@prisma/client';
import { OrgRole } from '@prisma/client';
import { env } from './env';
import { prisma } from './prisma';

export type AuthenticatedOrg = {
  id: string;
  name: string;
  role: OrgRole;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  orgs: AuthenticatedOrg[];
};

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

type UserWithMemberships = User & {
  orgs: (OrgUser & { org: Org })[];
};

const rolePriority: Record<OrgRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  WORKER: 1
};

export function signToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function serializeUser(user: UserWithMemberships): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    locale: user.locale,
    orgs: user.orgs.map((membership) => ({
      id: membership.org.id,
      name: membership.org.name,
      role: membership.role
    }))
  };
}

export async function loadUserWithMemberships(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { orgs: { include: { org: true } } }
  });

  return user ? serializeUser(user as UserWithMemberships) : null;
}

export async function loadUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { orgs: { include: { org: true } } }
  });

  return user ? (user as UserWithMemberships) : null;
}

function resolveOrgId(req: Request) {
  const headerValue = req.headers['x-org-id'];
  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }
  if (Array.isArray(headerValue) && headerValue.length > 0) {
    return headerValue[0];
  }

  const paramsValue = (req.params?.orgId as string | undefined) ?? undefined;
  if (paramsValue && typeof paramsValue === 'string') {
    return paramsValue;
  }

  return undefined;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await loadUserWithMemberships(payload.userId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireOrgRole(role: OrgRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orgId = resolveOrgId(req);
    if (!orgId) {
      return res.status(400).json({ error: 'Organization not specified' });
    }

    const membership = user.orgs.find((org) => org.id === orgId);
    if (!membership) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (rolePriority[membership.role] < rolePriority[role]) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}
