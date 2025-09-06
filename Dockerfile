FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY /src/static ./static

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/static ./static
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/static ./dist/static
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]