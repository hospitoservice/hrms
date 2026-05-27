# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Install all node_modules once and reuse across both targets.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --prefer-offline


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — development
# Runs the Vite dev server with hot-module replacement.
# The host/port are already set in vite.config.ts (0.0.0.0 / 3000).
# Used by docker-compose target: development
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS development

WORKDIR /app

# Copy source; volume mounts in docker-compose will override these at runtime
# for live hot-reload without rebuilding the image.
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — builder
# Compiles the Vite production bundle into /app/dist.
# VITE_EMPLOYEE_SERVICE_URL must be passed as a build-arg because Vite inlines
# all VITE_* variables into the JS bundle at build time (not runtime).
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

ARG VITE_EMPLOYEE_SERVICE_URL
ENV VITE_EMPLOYEE_SERVICE_URL=${VITE_EMPLOYEE_SERVICE_URL}

COPY . .

RUN npm run build


# ─────────────────────────────────────────────────────────────────────────────
# Stage 4 — production
# Serves the compiled static bundle with nginx.
# This is the default target (no --target flag needed).
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]