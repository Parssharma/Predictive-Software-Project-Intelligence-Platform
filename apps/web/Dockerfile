FROM node:25-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.5.1 --activate
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter @ppi/web...

FROM base AS runner
COPY --from=deps /app /app
COPY apps/web apps/web
COPY tsconfig.base.json ./
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "dev"]
