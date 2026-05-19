# MarkaRadar Backend — Geliştirme Planı

**Stack:** NestJS (TypeScript) + PostgreSQL 16 + Redis + Prisma + BullMQ
**Yerel:** Docker Compose (postgres + redis + minio)
**Production:** PM2 (Docker YOK), sistemdeki mevcut Postgres/Redis paylaşımlı
**Repo:** `markaradar-api` (tek repo, modüler monolit)

---

## 1. Stack kararları ve gerekçe

| Katman | Seçim | Neden |
|---|---|---|
| Framework | **NestJS 10+** | Modüler, TypeScript-first, DI, decorators, mature ekosistem |
| ORM | **Prisma 5+** | Type-safe, migration sistemi modern, dev experience iyi |
| DB | **PostgreSQL 16** | JSONB, full-text search, partitioning — strateji şemasına uygun |
| Cache/Queue | **Redis 7** | Cache + BullMQ queue + rate limit + session |
| Queue worker | **BullMQ** | AI üretim, mail, sosyal medya jobs için |
| Storage | **MinIO** (local) / **Cloudflare R2** (prod) | S3 uyumlu, ucuz |
| Search | **Meilisearch** (faz 2) | Site içi arama, başlangıçta Postgres FTS yeter |
| Auth | **Passport + JWT + refresh token** | Stateless, mobile-ready |
| Validation | **class-validator + Zod** | DTO validation + API typing |
| Mail | **Resend** (transactional) + **Beehiiv API** (newsletter) | İki ayrı sistem |
| Payment | **Stripe** (international) + **iyzico** (TR) | İkili gateway |
| Logging | **Pino** | Hızlı, structured JSON |
| Monitoring | **Sentry** (error) + **PostHog** (product analytics) | Free tier yeterli başlangıçta |
| Test | **Vitest** + **Supertest** | Jest'ten hızlı |

---

## 2. Repo + Klasör yapısı

```
markaradar-api/
├── .env.example              # tüm env keys örnek
├── .env.local                # yerel geliştirme (gitignore'da)
├── .env.production           # prod (sunucuda, gitignore'da)
├── .gitignore
├── .nvmrc                    # node 20
├── .editorconfig
├── .prettierrc
├── .eslintrc.cjs
├── docker-compose.yml        # YEREL ortam (postgres + redis + minio)
├── docker-compose.override.yml.example  # opsiyonel kişisel ayarlar
├── ecosystem.config.js       # PM2 prod config
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.build.json
├── README.md
│
├── prisma/
│   ├── schema.prisma         # tek schema (modüller halinde split file ile)
│   ├── migrations/
│   └── seed.ts               # ilk seed datası (admin user, kategoriler vs)
│
├── scripts/
│   ├── deploy.sh             # prod deploy script (git pull, build, pm2 reload)
│   ├── backup-db.sh          # postgres dump
│   └── seed-dev.ts           # yerel test datası
│
├── src/
│   ├── main.ts               # bootstrap
│   ├── app.module.ts         # root module
│   ├── app.controller.ts     # /health, /version
│   │
│   ├── config/
│   │   ├── env.validation.ts # Zod ile env validate
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── storage.config.ts
│   │   └── index.ts
│   │
│   ├── common/
│   │   ├── decorators/       # @CurrentUser, @Public, @Roles
│   │   ├── guards/           # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/     # LoggingInterceptor, TransformInterceptor
│   │   ├── filters/          # AllExceptionsFilter
│   │   ├── pipes/            # ValidationPipe (custom)
│   │   ├── middleware/       # RequestIdMiddleware
│   │   └── dto/              # PaginationDto, etc.
│   │
│   ├── shared/
│   │   ├── prisma/           # PrismaService, PrismaModule
│   │   ├── redis/            # RedisService (cache + raw client)
│   │   ├── queue/            # BullMQ wrapper
│   │   ├── storage/          # S3/MinIO/R2 abstract
│   │   ├── mail/             # Resend wrapper
│   │   ├── logger/           # Pino setup
│   │   └── http/             # web_fetch wrapper (AI pipeline için)
│   │
│   └── modules/
│       ├── auth/             # login, register, refresh, password reset
│       ├── users/            # profile, roles
│       ├── content/          # articles, categories, tags
│       ├── media/            # upload, image resize
│       ├── agencies/         # agency profiles
│       ├── reviews/          # agency reviews (verified)
│       ├── jobs/             # iş ilanları
│       ├── employer-brands/  # employer microsite
│       ├── ads/              # advertisers, campaigns, ad_slots
│       ├── newsletter/       # subscribers, issues, Beehiiv sync
│       ├── subscriptions/    # MarkaRadar+ premium (Stripe/iyzico)
│       ├── courses/          # akademi
│       ├── events/           # etkinlik + ödül
│       ├── reports/          # premium rapor mağazası
│       ├── research-panel/   # Türkiye Pazarlama Endeksi
│       ├── community/        # Slack entegrasyonu
│       ├── ai/               # AI üretim servisleri (OpenAI/Anthropic)
│       ├── social/           # LinkedIn/Buffer/Meta entegrasyonları
│       ├── analytics/        # event tracking
│       └── admin/            # admin-only endpoints
│
└── test/
    ├── e2e/
    └── unit/
```

---

## 3. Docker — YEREL ortam (`docker-compose.yml`)

> Sadece local dev. Prod'da Docker YOK.

```yaml
# docker-compose.yml — yerel geliştirme için
version: "3.9"

name: markaradar-local

services:
  postgres:
    image: postgres:16-alpine
    container_name: markaradar_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: markaradar
      POSTGRES_PASSWORD: dev_password_change_me
      POSTGRES_DB: markaradar_dev
      TZ: Europe/Istanbul
    ports:
      - "5433:5432"          # 5433 → diğer projelerle çakışmasın
    volumes:
      - markaradar_pg_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U markaradar -d markaradar_dev"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: markaradar_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6380:6379"          # 6380 → diğer projelerle çakışmasın
    volumes:
      - markaradar_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  minio:
    image: minio/minio:latest
    container_name: markaradar_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: markaradar
      MINIO_ROOT_PASSWORD: dev_minio_password
    ports:
      - "9100:9000"          # API
      - "9101:9001"          # Console UI
    volumes:
      - markaradar_minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s

  mailhog:
    image: mailhog/mailhog:latest
    container_name: markaradar_mailhog
    restart: unless-stopped
    ports:
      - "1025:1025"          # SMTP
      - "8025:8025"          # Web UI (http://localhost:8025)

volumes:
  markaradar_pg_data:
  markaradar_redis_data:
  markaradar_minio_data:
```

**Port stratejisi:** Diğer projelerle çakışmasın diye standart port + 1/2:
- Postgres: **5433** (5432 başka proje)
- Redis: **6380** (6379 başka proje)
- MinIO API: **9100**, Console: **9101**
- MailHog: **1025/8025**

**Komutlar:**
```bash
# Başlat
docker compose up -d

# Logları izle
docker compose logs -f postgres

# Durdur (data korunur)
docker compose stop

# Tamamen sil (data dahil)
docker compose down -v

# Restart sadece postgres
docker compose restart postgres

# psql bağlan
docker exec -it markaradar_postgres psql -U markaradar -d markaradar_dev

# redis-cli bağlan
docker exec -it markaradar_redis redis-cli
```

---

## 4. Env dosyaları

### `.env.example` (commit edilir, şablon)

```bash
# ─── App ──────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
PUBLIC_URL=http://localhost:3001              # next.js public site
ADMIN_URL=http://localhost:3002               # next.js admin
LOG_LEVEL=debug
TZ=Europe/Istanbul

# ─── Database ─────────────────────────────────────────────
DATABASE_URL="postgresql://markaradar:dev_password_change_me@localhost:5433/markaradar_dev?schema=public"

# ─── Redis ────────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=0

# BullMQ ayrı db kullanır (queue izolasyonu)
QUEUE_REDIS_DB=1

# ─── Auth ─────────────────────────────────────────────────
JWT_SECRET=change_me_long_random_string_min_64_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_different_long_random_string
JWT_REFRESH_EXPIRES_IN=30d

# ─── Storage (yerel: MinIO, prod: Cloudflare R2) ──────────
STORAGE_DRIVER=s3                             # s3 | local
S3_ENDPOINT=http://localhost:9100             # MinIO yerel; prod: R2 endpoint
S3_REGION=auto
S3_BUCKET=markaradar-media
S3_ACCESS_KEY=markaradar
S3_SECRET_KEY=dev_minio_password
S3_PUBLIC_URL=http://localhost:9100/markaradar-media

# ─── AI Providers ─────────────────────────────────────────
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=
DEFAULT_AI_MODEL=gpt-4o-mini
AI_MONTHLY_BUDGET_USD=500

# ─── Mail (Resend transactional) ──────────────────────────
RESEND_API_KEY=re_...
MAIL_FROM=hello@markaradar.com
MAIL_FROM_NAME=MarkaRadar
# Yerelde MailHog kullan (SMTP)
SMTP_HOST=localhost
SMTP_PORT=1025

# ─── Newsletter (Beehiiv) ─────────────────────────────────
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=

# ─── Payment ──────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# ─── Sosyal medya (faz 2'de doldur) ───────────────────────
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
BUFFER_ACCESS_TOKEN=

# ─── Monitoring ───────────────────────────────────────────
SENTRY_DSN=
POSTHOG_API_KEY=
POSTHOG_HOST=https://eu.posthog.com

# ─── Rate limiting ────────────────────────────────────────
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ─── CORS ─────────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

### `.env.local` (gitignore — geliştirici makinası)

`.env.example`'i kopyala, gerçek dev keys'i doldur. Postgres+Redis için Docker Compose'daki credentials kullan.

### `.env.production` (sunucu, gitignore — manuel deploy)

```bash
NODE_ENV=production
PORT=4001                                      # sunucudaki diğer projelerle çakışmasın

# ★ Mevcut sunucu Postgres'i kullan (Docker değil)
DATABASE_URL="postgresql://markaradar_prod:STRONG_PASSWORD@127.0.0.1:5432/markaradar_prod?schema=public&connection_limit=20"

# ★ Mevcut sunucu Redis'i kullan, ayrı DB
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=                                # varsa
REDIS_DB=3                                     # diğer projelerle çakışmasın
QUEUE_REDIS_DB=4

# Storage: Cloudflare R2
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=markaradar-media
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_URL=https://media.markaradar.com

JWT_SECRET=...64+ char random...
JWT_REFRESH_SECRET=...different 64+...

# Gerçek API keys
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_live_...
SENTRY_DSN=https://...@sentry.io/...

CORS_ORIGINS=https://markaradar.com,https://www.markaradar.com,https://admin.markaradar.com
LOG_LEVEL=info
```

---

## 5. PM2 — Production deploy (`ecosystem.config.js`)

> Sunucuda Docker yok. Mevcut Postgres/Redis sistem servisi olarak çalışıyor. NestJS app PM2 ile process olarak yönetilir.

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "markaradar-api",
      script: "dist/main.js",
      cwd: "/var/www/markaradar-api",
      instances: 2,                          // cluster mode: 2 worker
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
      env_file: ".env.production",
      max_memory_restart: "800M",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "30s",
      out_file: "/var/log/pm2/markaradar-api.out.log",
      error_file: "/var/log/pm2/markaradar-api.err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      kill_timeout: 5000,
    },
    {
      name: "markaradar-worker",             // BullMQ worker ayrı process
      script: "dist/worker.js",
      cwd: "/var/www/markaradar-api",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      env_file: ".env.production",
      max_memory_restart: "1G",              // AI üretim memory yer
      autorestart: true,
      out_file: "/var/log/pm2/markaradar-worker.out.log",
      error_file: "/var/log/pm2/markaradar-worker.err.log",
    },
  ],

  deploy: {
    production: {
      user: "deploy",                        // sunucudaki deploy user
      host: "markaradar.com",
      ref: "origin/main",
      repo: "git@github.com:markaradar/api.git",
      path: "/var/www/markaradar-api",
      "post-deploy":
        "pnpm install --frozen-lockfile && pnpm prisma migrate deploy && pnpm build && pm2 reload ecosystem.config.js --update-env",
    },
  },
};
```

**PM2 komutları (sunucuda):**
```bash
# İlk kurulum
cd /var/www/markaradar-api
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm build
pm2 start ecosystem.config.js

# Durum
pm2 list                                     # ← senin kullandığın komut
pm2 logs markaradar-api
pm2 logs markaradar-worker --lines 200
pm2 monit                                    # real-time CPU/RAM

# Reload (zero-downtime)
pm2 reload markaradar-api

# Restart (downtime var)
pm2 restart markaradar-api

# Boot'ta otomatik başlat
pm2 startup
pm2 save
```

**Sunucuda kullanılacak portlar:**
- API: **4001** (.env.production'da PORT=4001 — diğer projelerle çakışmasın)
- Nginx reverse proxy: `api.markaradar.com` → `127.0.0.1:4001`

---

## 6. Veritabanı — Prisma stratejisi

### `prisma/schema.prisma` (split — büyüdükçe yönetilebilir)

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex", "prismaSchemaFolder"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Prisma 5.15+ ile schema folder split:
// prisma/schema/
//   ├── auth.prisma
//   ├── content.prisma
//   ├── agencies.prisma
//   ├── reviews.prisma
//   ├── subscriptions.prisma
//   ├── courses.prisma
//   └── ...
```

### Migration workflow

```bash
# Yerel — schema değişikliği yap, migrate üret
pnpm prisma migrate dev --name add_agency_reviews

# Prisma Client güncellensin
pnpm prisma generate

# Yerel db'yi sıfırla (sadece dev)
pnpm prisma migrate reset

# Production — sadece deploy
pnpm prisma migrate deploy

# Studio (GUI db browser)
pnpm prisma studio
```

### Seed datası

```typescript
// prisma/seed.ts — yerel ve staging için
// - 1 admin user (admin@markaradar.com)
// - 8 kategori
// - 20 etiket
// - 5 demo makale (AI alanları doldurulmuş)
// - 10 demo ajans
// - 5 demo iş ilanı
```

---

## 7. Modül geliştirme sırası — sprint planı

> Her sprint 1 hafta. Toplam **MVP için 8 hafta** = 2 ay yoğun backend dev.

### Sprint 1 — Foundation
- [ ] Repo + skeleton (NestJS init, Prisma, ESLint, Prettier)
- [ ] Docker Compose çalışıyor (postgres+redis+minio+mailhog)
- [ ] `.env.example` + config validation
- [ ] Health check endpoint
- [ ] Logger (Pino) + error filter + request ID middleware
- [ ] Database connection + Prisma migrate ilk migration

### Sprint 2 — Auth + Users
- [ ] User schema (Prisma)
- [ ] Register / login / refresh / logout
- [ ] JWT guard + roles guard
- [ ] Password reset flow (Resend ile e-posta)
- [ ] @CurrentUser decorator
- [ ] Seed: ilk admin user

### Sprint 3 — Content (articles, categories, tags)
- [ ] Article CRUD (admin)
- [ ] Category + Tag CRUD
- [ ] Public article list/detail endpoints
- [ ] Article search (Postgres FTS)
- [ ] Slug generator + view counter
- [ ] Image upload → MinIO (storage abstract)

### Sprint 4 — AI Pipeline
- [ ] OpenAI / Anthropic client wrapper
- [ ] Prompt library (system + user templates)
- [ ] AI üretim endpoints (title, body, summary, social posts)
- [ ] `ai_generations` log tablosu
- [ ] BullMQ worker (uzun süreli AI üretim queue'ya)
- [ ] Cost tracking + monthly budget guard
- [ ] Web fetch wrapper (kaynak temizleme)

### Sprint 5 — Newsletter
- [ ] Subscriber CRUD
- [ ] Beehiiv API entegrasyonu (sync)
- [ ] Newsletter issue compose (AI ile günlük "Pazarlama 5" üretici)
- [ ] Subscribe/unsubscribe public endpoints
- [ ] Double opt-in flow
- [ ] Aggregate metrics (open/click — Beehiiv webhook)

### Sprint 6 — Agencies + Verified Reviews
- [ ] Agency CRUD (admin + public)
- [ ] Agency tier (free/basic/premium/featured/elite)
- [ ] Review submission flow (rate limited, KVKK consent)
- [ ] Email verification + LinkedIn URL validation
- [ ] Moderation queue (admin)
- [ ] Right to reply
- [ ] Anti-fraud detection (similarity check + rate limit)

### Sprint 7 — Subscriptions + Payments
- [ ] Stripe entegrasyonu (Lite/Pro/Enterprise tarifeleri)
- [ ] iyzico entegrasyonu (TR ödemeler)
- [ ] Webhook handler (Stripe → status update)
- [ ] Dunning flow (failed payment retry)
- [ ] Cancellation flow + winback campaign tetikleyici
- [ ] Premium paywall guard

### Sprint 8 — Jobs + Reports + Admin polish
- [ ] Job posting CRUD + paid tiers
- [ ] Employer brand microsite
- [ ] Report sales (file upload + download token)
- [ ] Admin dashboard endpoints (metrics)
- [ ] Analytics events
- [ ] Rate limit + CORS hardening

### Sprint 9+ (faz 2)
- Courses (Akademi)
- Events + Awards
- Research panel (Türkiye Pazarlama Endeksi)
- Community (Slack)
- Social posting (LinkedIn/Buffer)

---

## 8. İlk hafta — günlük operasyon

### Gün 1 — Skeleton + Docker
```bash
# Repo aç
mkdir markaradar-api && cd markaradar-api
git init
pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git

# Dependencies
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/throttler
pnpm add prisma @prisma/client
pnpm add ioredis bullmq
pnpm add passport passport-jwt passport-local
pnpm add bcrypt class-validator class-transformer
pnpm add nestjs-pino pino-pretty
pnpm add resend
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
pnpm add zod

pnpm add -D @types/bcrypt @types/passport-jwt @types/passport-local
pnpm add -D vitest @vitest/coverage-v8 supertest @types/supertest

# Prisma init
pnpm prisma init

# Docker compose dosyasını yaz, başlat
docker compose up -d
docker compose ps
```

### Gün 2 — Config + Prisma + ilk migration
- `.env.example` + Zod validation
- Prisma schema: users + categories tabloları
- `pnpm prisma migrate dev --name init`
- PrismaService + PrismaModule
- Seed script

### Gün 3 — Auth modülü
- Register/login/refresh endpoints
- JWT guard
- Password hash (bcrypt)
- Refresh token rotation

### Gün 4 — Users + roles
- Profile endpoint
- Admin user creation
- Roles guard (@Roles decorator)

### Gün 5 — Content (articles temel)
- Article CRUD
- Slug generator
- Public list/detail

### Gün 6-7 — Toparlama
- Test yazma (auth + articles)
- README'yi yaz
- Production deploy script tasla
- İlk PM2 ecosystem dosyası test

---

## 9. Production sunucu hazırlık checklist

Sunucuya deploy etmeden önce **bir kez** yapılacaklar:

```bash
# 1. Mevcut Postgres'te user + db oluştur
sudo -u postgres psql <<EOF
CREATE USER markaradar_prod WITH PASSWORD 'STRONG_PASSWORD_HERE';
CREATE DATABASE markaradar_prod OWNER markaradar_prod;
GRANT ALL PRIVILEGES ON DATABASE markaradar_prod TO markaradar_prod;
\c markaradar_prod
GRANT ALL ON SCHEMA public TO markaradar_prod;
EOF

# 2. Mevcut Redis'in DB 3+4'ünü MarkaRadar için ayır
# (Redis 16 DB destekler — 0,1,2 başka projeler olabilir, 3 cache, 4 queue olsun)
redis-cli -n 3 PING
redis-cli -n 4 PING

# 3. Deploy user oluştur (yoksa)
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/markaradar-api
sudo chown deploy:deploy /var/www/markaradar-api

# 4. Node 20 + pnpm + PM2 (yoksa)
# nvm zaten varsa:
nvm install 20 && nvm use 20
npm i -g pnpm@latest pm2@latest

# 5. Repo klonla
sudo -u deploy git clone git@github.com:markaradar/api.git /var/www/markaradar-api
cd /var/www/markaradar-api

# 6. .env.production yükle (scp ile)
# Yerel:
# scp .env.production deploy@server:/var/www/markaradar-api/.env.production

# 7. Build + migrate + start
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm build
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # ← çıktıdaki komutu sudo ile çalıştır

# 8. Log dizini
sudo mkdir -p /var/log/pm2
sudo chown deploy:deploy /var/log/pm2

# 9. Nginx reverse proxy
sudo nano /etc/nginx/sites-available/api.markaradar.com
# (config aşağıda)
sudo ln -s /etc/nginx/sites-available/api.markaradar.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 10. SSL (Let's Encrypt)
sudo certbot --nginx -d api.markaradar.com
```

### Nginx config — `/etc/nginx/sites-available/api.markaradar.com`

```nginx
server {
    listen 80;
    server_name api.markaradar.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.markaradar.com;

    # SSL — certbot dolduracak
    ssl_certificate /etc/letsencrypt/live/api.markaradar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.markaradar.com/privkey.pem;

    client_max_body_size 25M;             # image upload için
    keepalive_timeout 65;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Health check sadece internal
    location /health {
        proxy_pass http://127.0.0.1:4001/health;
        access_log off;
    }
}
```

---

## 10. Deploy workflow (sonraki her release)

```bash
# Yerel'de
git push origin main

# Sunucuda (manuel, basit)
ssh deploy@markaradar.com
cd /var/www/markaradar-api
git pull origin main
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm build
pm2 reload ecosystem.config.js --update-env

# Status kontrol
pm2 list
pm2 logs markaradar-api --lines 50

# Yerel'den tek komutla (alternatif — scripts/deploy.sh)
ssh deploy@markaradar.com "cd /var/www/markaradar-api && \
  git pull && pnpm install --frozen-lockfile && \
  pnpm prisma migrate deploy && pnpm build && \
  pm2 reload ecosystem.config.js --update-env"
```

---

## 11. Yerel dev workflow (günlük)

```bash
# Sabah başlangıç
docker compose up -d              # postgres + redis + minio başlat
pnpm install                      # yeni dependency varsa
pnpm prisma migrate dev           # yeni migration varsa apply
pnpm start:dev                    # NestJS watch mode

# Ayrı terminalde — worker (BullMQ)
pnpm start:worker:dev

# Prisma Studio (DB browser)
pnpm prisma studio                # localhost:5555

# Test
pnpm test                         # unit
pnpm test:e2e                     # entegrasyon

# Lint + format
pnpm lint --fix
pnpm format

# Akşam kapatma (opsiyonel)
docker compose stop               # container durur, data korunur
```

---

## 12. Önemli komutlar özet

```bash
# Docker
docker compose up -d              # başlat
docker compose ps                 # durum
docker compose logs -f postgres   # log
docker compose down               # durdur (data korunur)
docker compose down -v            # data dahil sil

# Prisma
pnpm prisma migrate dev --name X  # yerel migration
pnpm prisma migrate deploy        # prod migration
pnpm prisma generate              # client güncelle
pnpm prisma studio                # GUI
pnpm prisma db seed               # seed

# NestJS
pnpm start:dev                    # dev (watch)
pnpm build                        # prod build
pnpm start:prod                   # prod start (local test)

# PM2 (sunucuda)
pm2 list                          # ← senin kullandığın
pm2 logs markaradar-api
pm2 reload markaradar-api         # zero-downtime
pm2 restart markaradar-api        # full restart
pm2 monit                         # real-time
pm2 save                          # mevcut state kaydet

# Git deploy
ssh deploy@server "cd /var/www/markaradar-api && git pull && pnpm install && pnpm build && pm2 reload all"
```

---

## 13. Sonraki adım — kararlar

Bu plan üzerinden ilerlemeden önce 4 küçük karar lazım:

1. **Repo adı kesin?** Önerim: `markaradar-api` (sade, public/admin/landing ayrı reposlarda olacak).
2. **Prisma vs TypeORM?** Önerim: **Prisma** (daha modern, type-safe, migration kolay). TypeORM tercih edersen schema yaklaşımı değişir.
3. **pnpm vs npm?** Önerim: **pnpm** (hızlı, disk verimli, monorepo'ya hazır).
4. **Sunucudaki Postgres versiyonu?** Hangi versiyon? (15+ ise sorun yok, eski ise Prisma JSONB özelliklerinde dikkatli olmak gerek.) `psql -V` kontrol et.

Bu kararları onayla, **Sprint 1'i (skeleton + Docker)** kod olarak yazmaya başlayayım.
