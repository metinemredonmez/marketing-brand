# Production Deploy Guide

3 deploy yolu var. Senin için sıralı tercih:

## 🚀 Yol A — Railway + Vercel (önerilen, en hızlı)

**Maliyet:** $5-30/ay (Railway) + $0 (Vercel free tier)
**Süre:** 30-45 dakika

### 1. Railway (API + Postgres + Redis + Worker)

1. https://railway.app → GitHub ile giriş
2. **New Project → Deploy from GitHub repo** → `metinemredonmez/marketing-brand`
3. Railway 4 servis algılayacak (eklemen lazım):
   - **api** → root dir: `api/`, Dockerfile algılar
   - **worker** → "+ New Service from same repo" → root: `api/`, start command: `node dist/worker.js`
   - **postgres** → "+ Database → PostgreSQL"
   - **redis** → "+ Database → Redis"
4. **Variables sekmesinde** her servise:

   **api + worker** için:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=<openssl rand -base64 48>
   JWT_REFRESH_SECRET=<openssl rand -base64 48>
   APP_URL=https://api.markaradar.com
   COOKIE_DOMAIN=.markaradar.com
   CORS_ORIGINS=https://markaradar.com,https://admin.markaradar.com
   S3_ENDPOINT=https://<R2-ACCOUNT>.r2.cloudflarestorage.com
   S3_BUCKET=markaradar-media
   S3_ACCESS_KEY=<R2-key>
   S3_SECRET_KEY=<R2-secret>
   S3_PUBLIC_URL=https://media.markaradar.com
   OPENAI_API_KEY=<sk-...>
   RESEND_API_KEY=<re_...>
   STRIPE_SECRET_KEY=<sk_live_...>
   STRIPE_WEBHOOK_SECRET=<whsec_...>
   SENTRY_DSN=<DSN>
   MAIL_FROM=noreply@markaradar.com
   NODE_ENV=production
   ```

5. **Custom domain** → api servisine `api.markaradar.com` ekle. Railway sana bir CNAME verir → Cloudflare DNS'e ekle.

### 2. Vercel (Web + Admin)

1. https://vercel.com → GitHub ile giriş
2. **Add New → Project** → `marketing-brand` repo'su
3. **2 ayrı proje** oluştur:

   **Proje 1 — Web:**
   - Root Directory: `web`
   - Build Command: `yarn build`
   - Env vars:
     ```
     NEXT_PUBLIC_API_URL=https://api.markaradar.com
     NEXT_PUBLIC_SITE_URL=https://markaradar.com
     NEXT_PUBLIC_SENTRY_DSN=<web-sentry-DSN>
     NEXT_PUBLIC_ENV=production
     ```
   - Custom domain: `markaradar.com` + `www.markaradar.com`

   **Proje 2 — Admin:**
   - Root Directory: `admin`
   - Env vars:
     ```
     NEXT_PUBLIC_API_URL=https://api.markaradar.com
     NEXT_PUBLIC_ADMIN_URL=https://admin.markaradar.com
     NEXT_PUBLIC_WEB_URL=https://markaradar.com
     NEXT_PUBLIC_SENTRY_DSN=<admin-sentry-DSN>
     ```
   - Custom domain: `admin.markaradar.com`

### 3. CI deploy otomatize (opsiyonel ama önerilir)

GitHub repo → **Settings → Secrets and variables → Actions**:

**Secrets:**
- `VERCEL_TOKEN` (https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` (Project Settings → General)
- `VERCEL_PROJECT_ID_WEB`
- `VERCEL_PROJECT_ID_ADMIN`
- `RAILWAY_TOKEN` (https://railway.app/account/tokens)

**Variables:**
- `DEPLOY_TARGET=railway` (veya `vps`)

→ Bundan sonra her `main` push otomatik deploy.

### 4. Cloudflare DNS + WAF

1. https://dash.cloudflare.com → domain ekle
2. DNS sekmesinde:
   ```
   markaradar.com         A      → Vercel IP (Vercel verir)
   www.markaradar.com     CNAME  → cname.vercel-dns.com
   admin.markaradar.com   CNAME  → cname.vercel-dns.com
   api.markaradar.com     CNAME  → <railway-host>.up.railway.app
   media.markaradar.com   CNAME  → <r2-account>.r2.dev   (R2 custom domain)
   ```
3. SSL/TLS → **Full (strict)**
4. Security → WAF → **Managed Rules ON**
5. Speed → **Brotli ON**
6. Rules → **Cache Rules** → static assets aggressive cache

### 5. İlk migration + seed

Railway'de tek seferlik:
```bash
railway login
railway run --service api -- yarn prisma migrate deploy
# Opsiyonel: railway run --service api -- yarn prisma db seed   (sadece demo veri istersen)
```

### 6. Hazır
- Marketing: https://markaradar.com
- Admin: https://admin.markaradar.com
- API: https://api.markaradar.com/api/v1/health
- Sentry'de error monitoring ✓
- CI/CD ile auto-deploy ✓

---

## 🚢 Yol B — Self-hosted VPS (DigitalOcean / Hetzner)

**Maliyet:** $6-24/ay (1 droplet)
**Süre:** 1-2 saat
**Avantaj:** her şey tek yerde, tam kontrol

### 1. VPS hazırla
- DigitalOcean $12/ay droplet (2GB RAM, 50GB SSD, Frankfurt)
- veya Hetzner CX21 €5.83/ay (4GB RAM)
- Ubuntu 24.04 LTS

### 2. İlk kurulum (sunucuda SSH)
```bash
# Docker + compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Clone
cd ~
git clone https://github.com/metinemredonmez/marketing-brand.git
cd marketing-brand

# Env
cp .env.prod.example .env.prod
nano .env.prod    # tüm key'leri doldur (openssl rand -base64 48 ile secret'lar)

# Cloudflare DNS'inde A record → bu droplet'in IP'sine yönlendir:
#   markaradar.com         A   <droplet-ip>
#   www.markaradar.com     A   <droplet-ip>
#   admin.markaradar.com   A   <droplet-ip>
#   api.markaradar.com     A   <droplet-ip>
# (Cloudflare Proxy "DNS only" — Caddy LE cert alabilsin)
```

### 3. Deploy
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml exec api yarn prisma migrate deploy

# Loglar
docker compose -f docker-compose.prod.yml logs -f
```

Caddy ilk request'te otomatik Let's Encrypt cert alır. Hazır.

### 4. CI auto-deploy
GitHub secrets:
- `VPS_HOST`
- `VPS_USER` (genelde `root` veya `deploy`)
- `VPS_SSH_KEY` (private key)

GitHub variable: `DEPLOY_TARGET=vps`

---

## 🔧 Yol C — Cloudflare Tunnel (5dk'da demo)

Gerçek deploy değil, ama localhost'unu internete açar:
```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:3003
# https://random-words.trycloudflare.com URL'i döner
```

Yatırımcı/müşteri demosu için yeterli.

---

## Geri yükleme (DB restore)

Self-hosted VPS:
```bash
docker compose -f docker-compose.prod.yml exec backup /usr/local/bin/restore.sh
# Veya belirli yedek:
# docker compose ... exec backup /usr/local/bin/restore.sh /backups/markaradar_20260520_030000.sql.gz
```

Railway: Dashboard → Database → Backups sekmesinden point-in-time recovery (Pro plan).

---

## Maliyet özeti (aylık)

| Bileşen | Yol A | Yol B |
|---|---|---|
| Hosting | Railway $5-30 + Vercel $0 | DigitalOcean $12 |
| Postgres | Railway (dahil) | Self-hosted (dahil) |
| Redis | Railway (dahil) | Self-hosted (dahil) |
| Cloudflare | $0 (WAF dahil free) | $0 |
| R2 (medya) | $0 (10GB free) | $0 |
| Sentry | $0 (10K event) | $0 |
| Domain | $10/yıl | $10/yıl |
| **Toplam** | **$15-40/ay** | **$15/ay** |

OpenAI/Resend gibi 3rd party servisler kullanıma göre değişir.
