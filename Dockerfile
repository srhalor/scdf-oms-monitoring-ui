# =============================================================================
# Dockerfile for Next.js Standalone Production Build
# Optimized for Kubernetes deployment with minimal image size
#
# Prerequisites: Run `pnpm install && pnpm build` in Azure Pipeline before docker build
# The .next/standalone folder must exist in the build context
# Note: .npmrc must have `node-linker=hoisted` to avoid symlink issues
# =============================================================================

FROM node:22-alpine AS runner
LABEL maintainer="OMS Monitoring Team"
LABEL description="SCDF OMS Monitoring UI - Next.js Application"

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy pre-built standalone output from Azure Pipeline build
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Start the application with graceful shutdown support
CMD ["node", "server.js"]
