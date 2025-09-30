# SafetySwift Monorepo

All project source lives inside the [`safetyswift/`](./safetyswift) directory.

## API Database Setup

1. Ensure the required environment variables from `.env.example` are available (e.g. `cp safetyswift/.env.example safetyswift/.env`).
2. Generate the Prisma client:
   ```bash
   pnpm --filter api exec prisma generate
   ```
3. Run the initial database migration:
   ```bash
   pnpm --filter api exec prisma migrate dev --name init
   ```
4. Seed the database with baseline data:
   ```bash
   pnpm --filter api run db:seed
   ```
