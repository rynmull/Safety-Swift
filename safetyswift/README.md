# SafetySwift

SafetySwift is a SaaS platform that helps contractors manage safety compliance with incident reporting, certification tracking, and OSHA form generation.

## Monorepo structure

```
.
├── apps
│   ├── api    # Node + Express + tRPC + Prisma backend
│   └── web    # Next.js 14 frontend
├── packages
│   ├── config # Shared ESLint and TypeScript configs
│   └── ui     # Shared UI component library
└── docker-compose.yml
```

## Requirements

- Node.js v20.10.0 (see `.nvmrc`)
- pnpm 8.x (Corepack is enabled by default with Node 20)
- Docker and Docker Compose for local services

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Generate the Prisma client:

   ```bash
   pnpm prisma:generate
   ```

3. Run database migrations:

   ```bash
   pnpm --filter @safetyswift/api db:migrate
   ```

4. Seed the database with starter data:

   ```bash
   pnpm --filter @safetyswift/api db:seed
   ```

5. Start the development servers (web and api):

   ```bash
   pnpm dev
   ```

6. Run tests, linting, and type checks:

   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

## Environment variables

Copy `.env.example` to `.env` at the repository root and adjust the values as needed.

## Docker services

`docker-compose.yml` configures the following services for local development:

- `db`: PostgreSQL 16
- `minio`: S3-compatible storage for uploads
- `mailpit`: Email testing server
- `api`: SafetySwift API (Express + tRPC)
- `web`: SafetySwift Next.js frontend

Start the stack with:

```bash
docker compose up --build
```

## Continuous Integration

GitHub Actions runs linting, type checking, tests, and builds for all workspaces to ensure the codebase stays production ready.
