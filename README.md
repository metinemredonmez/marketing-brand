# MarkaRadar

> Türkiye'nin AI-native pazarlama, reklam ve marka medyası.

**Stack:**
- **api/** — NestJS 10 + Prisma + PostgreSQL + Redis + BullMQ (port **4000**)
- **web/** — Next.js 15 (App Router, RSC, TS) — public site (port **3003**)
- **admin/** — Next.js 15 — editöryel + ticari yönetim paneli (port **3004**)
- **docs/** — strateji + mimari dokümanları

**Paket yöneticisi:** yarn 1.22 (corepack ile)

**Yerel ortam:** Docker (postgres + redis + minio + mailhog). Sadece dev. Production'da Docker YOK; PM2 + sistem servisleri.

---

## Hızlı başlangıç

### 1. Servisleri başlat (postgres + redis + minio + mailhog)
```bash
make up
```

Çıkması gereken portlar:
- Postgres: `localhost:5434`
- Redis: `localhost:6390`
- MinIO API: `localhost:9110` (Console: `localhost:9111`)
- MailHog UI: `localhost:8030`

### 2. Bağımlılıkları kur (yarn)
```bash
make install
```

### 3. Veritabanını hazırla
```bash
make migrate     # yarn prisma migrate dev
make seed        # yarn prisma db seed (admin user + örnek içerik)
```

### 4. Uygulamaları başlat (3 ayrı terminal)
```bash
make api         # http://localhost:4000  — Swagger: /docs
make web         # http://localhost:3003
make admin       # http://localhost:3004
```

---

## Komutlar (Makefile)

`make help` ile tam liste.

| Komut | Açıklama |
|---|---|
| `make up` | Docker servisleri başlat |
| `make down` | Durdur (data korunur) |
| `make reset` | Data dahil sil + yeniden başlat |
| `make logs` | Docker logs tail |
| `make psql` | Postgres CLI |
| `make redis-cli` | Redis CLI |
| `make migrate` | Prisma migration |
| `make studio` | Prisma Studio (DB browser) |
| `make api` | API'yi dev modda başlat |
| `make web` | Web'i dev modda başlat |
| `make admin` | Admin'i dev modda başlat |

---

## Klasör yapısı

```
brand/
├── docs/                          # tüm strateji + mimari (PDF + MD)
├── api/                           # NestJS backend
├── web/                           # Next.js public site
├── admin/                         # Next.js admin panel
├── docker-compose.yml             # yerel servisler
├── Makefile                       # kısayollar
└── README.md
```

---

## Dokümanlar

| Dosya | Ne içerir |
|---|---|
| `docs/MarkaRadar_Mimari.md` | Sistem mimarisi (bu repo'nun haritası) |
| `docs/MarkaRadar_v2_Hibrit_Strateji.pdf` | İş stratejisi (87 sayfa) |
| `docs/MarkaRadar_v2_Ekler.md` | Verified reviews, Mini MBA, premium onboarding, 7 günlük checklist |
| `docs/MarkaRadar_Backend_Plan.md` | Backend operasyonel plan (sprint, deploy, env) |

---

## Port haritası

| Servis | Yerel | Prod |
|---|---|---|
| web | 3003 | https://markaradar.com (Vercel önerisi) |
| admin | 3004 | https://admin.markaradar.com |
| api | 4000 | https://api.markaradar.com (PM2 cluster, nginx) |
| postgres | 5434 (docker) | 5432 (sistem) |
| redis | 6390 (docker) | 6379 (sistem, DB 3+4) |
| minio | 9110 | — (prod: Cloudflare R2) |
| mailhog | 1030/8030 | — (prod: Resend) |

---

## Lisans

İç kullanım için, MarkaRadar Strateji Ekibi.
