FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma/
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx nx build daily-questions

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/daily-questions/.next ./apps/daily-questions/.next
COPY --from=builder /app/apps/daily-questions/public ./apps/daily-questions/public
COPY --from=builder /app/apps/daily-questions/next.config.js ./apps/daily-questions/next.config.js
COPY --from=builder /app/apps/daily-questions/tsconfig.json ./apps/daily-questions/tsconfig.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/nx.json ./nx.json
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=builder /app/prisma ./prisma

COPY apps/daily-questions/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs
EXPOSE 3000

CMD ["./start.sh"]
