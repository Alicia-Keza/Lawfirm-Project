FROM node:22-bookworm-slim

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/data/rutabanks.db

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server.js ./
COPY src ./src
COPY views ./views
COPY public ./public
COPY scripts ./scripts

# The SQLite database lives in /app/data; mount a volume there so it survives redeploys
RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME ["/app/data"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://localhost:' + process.env.PORT + '/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
