FROM node:20.10.0-bullseye AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

RUN pnpm install --filter "@safetyswift/api..." --prod --no-frozen-lockfile

COPY . .

RUN pnpm --filter @safetyswift/api prisma generate
RUN pnpm --filter @safetyswift/api build

EXPOSE 4000
CMD ["pnpm", "--filter", "@safetyswift/api", "start"]
