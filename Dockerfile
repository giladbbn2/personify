FROM node:latest AS deps
WORKDIR /app

# Copy only the files needed to install dependencies
COPY package.json package-lock.json* ./

# Install dependencies with the preferred package manager
RUN npm ci

COPY /src/static ./static

FROM node:latest AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/static ./static

# Copy the rest of the files
COPY . .

# Run build with the preferred package manager
RUN npm run build

ENV NODE_ENV=production

# Re-run install only for production dependencies
RUN npm ci --only=production && npm cache clean --force

FROM node:latest AS runner
EXPOSE 3000
WORKDIR /app

# Copy the bundled code from the builder stage
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/static ./dist/static

# Use the node user from the image
USER node

# Start the server
CMD ["node", "dist/main.js"]