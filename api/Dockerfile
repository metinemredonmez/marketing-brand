# ─────────────────────────────────────────────────────────────
# NestJS API — multi-stage production build
# ─────────────────────────────────────────────────────────────

# ----- Stage 1: Deps (cache layer)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile --production=false

# ----- Stage 2: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn prisma generate
RUN yarn build

# ----- Stage 3: Production runtime
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl tini
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nest

# Production deps only
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile --production=true \
 && yarn cache clean

# Build output + Prisma client
COPY --from=builder --chown=nest:nodejs /app/dist ./dist
COPY --from=builder --chown=nest:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nest:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nest

EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

# tini = doğru sinyal yönetimi (SIGTERM PID 1'e ulaşsın)
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
