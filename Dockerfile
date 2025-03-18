# syntax=docker.io/docker/dockerfile:1

# Base stage with pnpm support
FROM node:18-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm fetch && \
  pnpm install --offline --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app

# Build arguments for environment variables
# ARG OPENAI_API_KEY
# ARG DATABASE_URL
# ARG NEXTAUTH_SECRET
# ARG NEXTAUTH_URL

# Convert build args to environment variables
# ENV OPENAI_API_KEY=${OPENAI_API_KEY}
# ENV DATABASE_URL=${DATABASE_URL}
# ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
# ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy public directory
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables for Next.js
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start command
CMD ["node", "server.js"]
