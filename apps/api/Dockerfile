FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json packages/db/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @ppi/api...

FROM base AS runner
COPY --from=deps /app /app
COPY packages/db packages/db
COPY apps/api apps/api
COPY tsconfig.base.json ./
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "dev"]
