FROM node:20.10.0-bullseye AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/

RUN pnpm install --filter "@safetyswift/web..." --prod --no-frozen-lockfile

COPY . .

RUN pnpm --filter @safetyswift/web build

EXPOSE 3000
CMD ["pnpm", "--filter", "@safetyswift/web", "start"]
