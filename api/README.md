# MarkaRadar API

NestJS 10 + Prisma + PostgreSQL + Redis + BullMQ backend.

## Geliştirme

```bash
# Root klasörden Docker'ı başlat (postgres + redis + minio)
cd .. && make up && cd api

# Bağımlılıklar
yarn install

# .env hazırla
cp .env.example .env.local
# JWT_SECRET, OPENAI_API_KEY vs doldur

# DB hazırla
yarn prisma migrate dev --name init
yarn db:seed

# Geliştirme sunucusu
yarn start:dev
# → http://localhost:4000
# → Swagger: http://localhost:4000/docs

# Health
curl http://localhost:4000/health
```

## Sprint 1 — Mevcut durum

✅ NestJS skeleton, ConfigModule, Pino logger, Throttler, CORS, Helmet
✅ Prisma — User + Category + Tag + Article tabloları
✅ Auth modülü — register, login, logout (httpOnly cookie + JWT)
✅ Users modülü — `/api/v1/users/me`
✅ Content modülü — `/api/v1/articles`, `/api/v1/articles/:slug`
✅ Health endpoint — `/health` (db + redis check)
✅ Swagger dev'de açık

## Sıradaki (Sprint 2-3)

- [ ] Refresh token rotation endpoint
- [ ] Roles guard + @Roles decorator
- [ ] Admin article CRUD endpoints
- [ ] Storage modülü (MinIO/R2 image upload)
- [ ] Rate limit auth endpoint'lerinde sıkı
- [ ] E2E test setup (Vitest + Supertest)

## Komutlar

```bash
yarn start:dev          # watch mode
yarn build              # prod build
yarn prisma migrate dev # yeni migration
yarn prisma studio      # GUI db browser
yarn test               # unit tests
yarn lint               # eslint
```

## Production deploy

```bash
# Sunucuda (.env.production hazır olmalı)
yarn install --frozen-lockfile
yarn prisma migrate deploy
yarn build
pm2 start ecosystem.config.js
pm2 save
```
