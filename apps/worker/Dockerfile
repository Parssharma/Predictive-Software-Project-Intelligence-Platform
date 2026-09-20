FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY apps/worker/package.json apps/worker/
RUN pnpm install --frozen-lockfile --filter @ppi/worker...

FROM base AS runner
COPY --from=deps /app /app
COPY packages/db packages/db
COPY apps/worker apps/worker
COPY tsconfig.base.json ./
WORKDIR /app/apps/worker
CMD ["pnpm", "dev"]
