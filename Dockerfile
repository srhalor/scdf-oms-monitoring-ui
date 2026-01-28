# =============================================================================
# Multi-stage Dockerfile for Next.js Application
# Builds and packages the application in Docker for consistent builds
# =============================================================================

# Stage 1: Dependencies
FROM node:22-alpine3.20 AS deps
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy pre-built standalone output (owned by root for immutability)
COPY .next/standalone ./
COPY public ./public
COPY .next/static ./.next/static
COPY certificates ./certificates

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 3000

# Start the application with graceful shutdown support
CMD ["node", "server.js"]
