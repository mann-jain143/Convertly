# Render production Dockerfile for Convertly backend API
FROM node:22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
  ffmpeg \
  pandoc \
  libreoffice \
  ca-certificates && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
