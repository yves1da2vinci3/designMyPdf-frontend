# Multi-stage Next.js 14 (standalone) — image runtime minimale.
#
# PUPPETEER_SKIP_DOWNLOAD=true : pas de téléchargement Chromium pendant `yarn install`
# (image plus légère et build plus rapide). La route API `pages/api/templates/[id]/export`
# qui lance Puppeteer ne pourra pas ouvrir de navigateur dans ce conteneur sans ajouter
# Chromium (image séparée, playwright, ou montage binaire) et retirer ce skip au build.
#
# Build (depuis la racine du dépôt) :
#   docker build -f frontend/Dockerfile -t designmypdf-frontend ./frontend
# Run :
#   docker run -p 3000:3000 designmypdf-frontend

FROM node:20-alpine AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases

RUN node .yarn/releases/yarn-4.1.1.cjs install --immutable

FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-args optionnels (ex. CI). Ne pas faire `ENV NEXT_PUBLIC_*=$ARG` quand l’ARG est absent :
# Docker injecte alors une chaîne vide, ce qui casse les repli `??` dans firebaseConfig.ts
# et provoque auth/invalid-api-key pendant `next build`.
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_HANDLER_URL
# Éviter les NEXT_PUBLIC_* vides : sinon Next inline "" et casse les `??` dans firebaseConfig.ts.
RUN set -e; \
  for v in NEXT_PUBLIC_FIREBASE_API_KEY NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN NEXT_PUBLIC_FIREBASE_PROJECT_ID \
           NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
           NEXT_PUBLIC_FIREBASE_APP_ID NEXT_PUBLIC_FIREBASE_AUTH_HANDLER_URL; do \
    eval "val=\${$v-}"; \
    [ -n "$val" ] || unset "$v" || true; \
  done; \
  node .yarn/releases/yarn-4.1.1.cjs build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
