FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production

LABEL org.opencontainers.image.title="Claude Inspect" \
      org.opencontainers.image.description="Interactive graph visualizer for Claude Code project configuration" \
      org.opencontainers.image.source="https://github.com/pavelvais/claude-inspect" \
      org.opencontainers.image.version="0.1.0" \
      org.opencontainers.image.authors="pavelvais"

COPY --from=build /app/.output ./.output
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
