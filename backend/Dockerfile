# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# `prisma generate` só lê o schema, não conecta no banco — esta URL existe
# apenas para satisfazer a validação do prisma.config.ts durante o build.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Aplica migrations pendentes antes de subir — aceitável para o tamanho
# atual do deploy (uma instância só); reavaliar se algum dia houver
# múltiplas réplicas rodando o mesmo container.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
