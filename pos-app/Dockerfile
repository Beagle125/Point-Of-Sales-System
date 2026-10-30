# --- Stage 1: Build Stage ---
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --production

# --- Stage 2: Production Run Stage ---
FROM node:24-alpine AS runner

WORKDIR /app

USER node

COPY --chown=node:node --from=builder /app/build ./build
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

ENV PORT=5173
ENV NODE_ENV=production

EXPOSE 5173

CMD ["node", "build"]