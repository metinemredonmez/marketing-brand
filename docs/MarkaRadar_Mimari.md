# MarkaRadar — Sistem Mimarisi

**Tarih:** Mayıs 2026
**Stack:** Next.js 15 (web + admin) + NestJS 10 (api) + PostgreSQL 16 + Redis 7
**Repo yaklaşımı:** Tek root klasör, 3 ayrı uygulama (api/web/admin), shared deploy yok
**Yerel:** Docker (sadece postgres + redis + minio + mailhog)
**Prod:** PM2 + sistem postgres/redis (Docker YOK)

---

## 1. Klasör yapısı — `/Users/emre/Desktop/brand/`

```
brand/
├── docs/                              # tüm strateji + mimari dokümanları (PDF + MD)
│   ├── MarkaRadar_Kapsamli_Strateji.pdf       # v1 orijinal
│   ├── MarkaRadar_v2_Hibrit_Strateji.pdf      # v2 hibrit (87 sayfa)
│   ├── MarkaRadar_v2_Hibrit_Strateji.md
│   ├── MarkaRadar_v2_Ekler.md
│   ├── MarkaRadar_Backend_Plan.md
│   ├── MarkaRadar_Mimari.md                   # bu doküman
│   └── build_pdf.py
│
├── api/                               # NestJS — backend (port 4000)
│   ├── prisma/
│   ├── src/
│   │   ├── modules/                   # auth, content, agencies, reviews, ...
│   │   ├── shared/                    # prisma, redis, queue, mail, storage
│   │   ├── common/                    # guards, decorators, filters
│   │   └── config/
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── ecosystem.config.js            # PM2 prod config
│   └── .env.example
│
├── web/                               # Next.js 15 — public site (port 3003)
│   ├── src/
│   │   ├── app/                       # App Router
│   │   │   ├── (marketing)/           # ana sayfa, haberler, kategoriler
│   │   │   │   ├── page.tsx
│   │   │   │   ├── haber/[slug]/
│   │   │   │   ├── kategori/[slug]/
│   │   │   │   ├── ajans-rehberi/
│   │   │   │   ├── is-ilanlari/
│   │   │   │   ├── akademi/
│   │   │   │   └── premium/
│   │   │   ├── (auth)/                # giriş/kayıt
│   │   │   ├── api/                   # Next route handlers (auth callback, OG image)
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/                # ui (shadcn) + features
│   │   ├── lib/                       # api client, hooks, utils
│   │   └── types/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── .env.example
│
├── admin/                             # Next.js 15 — admin panel (port 3004)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/           # auth korumalı
│   │   │   │   ├── icerik/
│   │   │   │   ├── ai-studyo/
│   │   │   │   ├── ajans/
│   │   │   │   ├── reviews/           # moderasyon kuyruğu
│   │   │   │   ├── newsletter/
│   │   │   │   ├── premium/
│   │   │   │   └── analitik/
│   │   │   ├── (auth)/login/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml                 # YEREL — postgres + redis + minio + mailhog
├── .env.example                       # root level shared notes
├── .gitignore
├── .editorconfig
├── README.md
└── Makefile                           # kısayollar (make dev, make migrate, ...)
```

**3 ayrı `package.json` — monorepo değil.** Her uygulama bağımsız. `pnpm install` her klasörde ayrı çalışır. Karmaşıklık yok, gerektiğinde sonra pnpm workspaces eklenebilir.

---

## 2. Mimari diyagramı

```
                            ┌──────────────────────┐
                            │   Cloudflare CDN     │
                            │   (DNS, WAF, R2)     │
                            └──────────┬───────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
        markaradar.com           api.markaradar.com      admin.markaradar.com
              │                        │                        │
        ┌─────▼──────┐          ┌──────▼──────┐         ┌──────▼─────┐
        │  Next.js   │          │   NestJS    │         │  Next.js   │
        │  web       │◄────────►│   api       │◄────────│  admin     │
        │  :3003     │   REST   │   :4000     │   REST  │  :3004     │
        └─────┬──────┘          └──────┬──────┘         └────────────┘
              │                        │
              │ (RSC fetch)            │
              │                        │ ┌─── Postgres :5432 (prod)
              │                        ├─┤      :5434 (yerel docker)
              │                        │ │
              │                        │ ├─── Redis :6379 (prod, DB 3+4)
              │                        │ │     :6390 (yerel docker)
              │                        │ │
              │                        │ ├─── R2 (prod) / MinIO :9110 (yerel)
              │                        │ │
              │                        │ ├─── OpenAI / Anthropic API
              │                        │ │
              │                        │ ├─── Resend (transactional mail)
              │                        │ ├─── Beehiiv (newsletter)
              │                        │ ├─── Stripe (international payment)
              │                        │ └─── iyzico (TR payment)
              │                        │
              ▼                        ▼
        Vercel / self-hosted     PM2 cluster (2x API + 1x Worker)
```

---

## 3. Port haritası (ÇOK ÖNEMLİ — Docker'daki diğer projelerle çakışmayacak)

### Yerel makine — şu an

| Port | Servis | Kaynak |
|---|---|---|
| **3000** | DOLU | başka proje (büyük ihtimal fal veya başka next.js) |
| **3001** | DOLU | başka proje |
| **3002** | DOLU | başka proje |
| **5432** | DOLU | başka postgres |
| **6379** | DOLU | başka redis |
| **6380** | DOLU | başka redis veya proxy |

### MarkaRadar yerel — kullanacağımız portlar

| Servis | Yerel port | Prod port |
|---|---|---|
| **web (Next.js)** | **3003** | 443 (CDN) |
| **admin (Next.js)** | **3004** | 443 (CDN) |
| **api (NestJS)** | **4000** | 4000 (nginx → 443) |
| **api worker (BullMQ)** | — | — |
| **postgres** | **5434** | 5432 (sistem) |
| **redis** | **6390** | 6379 (sistem, DB 3+4) |
| **minio API** | **9110** | yok (prod: R2) |
| **minio console** | **9111** | yok |
| **mailhog smtp** | **1030** | yok (prod: Resend) |
| **mailhog ui** | **8030** | yok |

### Prod sunucu port haritası

| Public | Internal | Servis |
|---|---|---|
| `markaradar.com` → 443 | — | Vercel (web) |
| `admin.markaradar.com` → 443 | — | Vercel (admin) |
| `api.markaradar.com` → 443 | nginx → 127.0.0.1:4000 | NestJS PM2 cluster |
| `media.markaradar.com` → 443 | — | Cloudflare R2 |

---

## 4. Uygulama sorumlulukları

### **web/** (Next.js 15, public)
- Marketing sayfaları (ana sayfa, makaleler, kategoriler)
- Ajans rehberi (public listing + agency profile)
- İş ilanları
- Akademi katalog (course details + checkout başlatma)
- Premium landing (MarkaRadar+ tarife sayfası)
- Newsletter abone formu
- Authentication (login/register → JWT in httpOnly cookie)
- SEO ağır (RSC + static + ISR)
- **Veri kaynağı:** api.markaradar.com'a fetch (RSC server-side)

### **admin/** (Next.js 15, korumalı)
- İçerik yönetimi (article CRUD)
- AI stüdyo (kaynak gir → 8 format AI üret)
- Ajans yönetimi + review moderasyon kuyruğu
- Newsletter editor (kompoze + zamanlama)
- Premium subscription yönetimi
- Analitik dashboard
- Kullanıcı/rol yönetimi
- **Auth:** Role-based, sadece `editor`, `social_manager`, `sales`, `super_admin`
- **Veri kaynağı:** api.markaradar.com'a fetch

### **api/** (NestJS 10)
- REST API (versionlu — `/api/v1/...`)
- Business logic + validation
- Database access (Prisma)
- AI üretim orkestrasyonu (OpenAI/Anthropic)
- BullMQ worker (mail, AI long-running, sosyal medya zamanlama)
- Webhooks (Stripe, iyzico, Beehiiv)
- File upload (signed URL → R2/MinIO)
- Auth (JWT + refresh)
- Rate limit + audit log

---

## 5. Auth akışı

```
┌─────────┐  POST /api/v1/auth/login    ┌─────────┐
│  Next   │ ────────────────────────►   │  Nest   │
│  web    │  { email, password }        │  api    │
│         │ ◄────────────────────────   │         │
└────┬────┘  { user, accessToken,       └─────────┘
     │         refreshToken }
     │
     ▼ Set httpOnly cookie:
       - mr_access (15min, JWT)
       - mr_refresh (30days, JWT)

Sonraki istekler:
┌─────────┐  GET /api/v1/articles       ┌─────────┐
│  Next   │  Cookie: mr_access=...      │  Nest   │
│  RSC    │ ────────────────────────►   │  api    │
└─────────┘                              └─────────┘

Token expire → 401 → /auth/refresh otomatik (Next middleware)
```

**Premium paywall:**
- Article detail RSC server-side fetch
- `user.subscription_tier` kontrol → premium içerikse `is_premium_locked: true`
- Web tarafı paywall component göster

---

## 6. AI içerik pipeline (sıralı akış)

```
Editör (admin/ai-studyo)
       │
       │ Adım 1: kaynak girer (URL veya yapıştırılan metin)
       ▼
   POST /api/v1/ai/generate
   { source_type, source_content, target_formats, tone }
       │
       ▼
┌────────────────────────────────────────────────────┐
│  NestJS — AiOrchestratorService                    │
│  ├─ web_fetch → kaynak temizle                     │
│  ├─ BullMQ queue → "ai-generation" job             │
│  └─ İlk response: { jobId, status: "queued" }      │
└────────────────────────────────────────────────────┘
       │
       │ (paralel olarak background worker)
       ▼
┌────────────────────────────────────────────────────┐
│  Worker (ayrı PM2 process)                         │
│  ├─ OpenAI/Anthropic'e paralel 8 prompt           │
│  │   ├─ başlık (5 varyant)                        │
│  │   ├─ spot (3 varyant)                          │
│  │   ├─ haber gövdesi                             │
│  │   ├─ AI özet + neden önemli                    │
│  │   ├─ markalar/ajanslar için çıkarım            │
│  │   ├─ LinkedIn postu                            │
│  │   ├─ Instagram carousel                        │
│  │   └─ Reels script                              │
│  ├─ ai_generations tablosuna logla (cost tracking)│
│  └─ WebSocket veya polling ile editöre push       │
└────────────────────────────────────────────────────┘
       │
       ▼
Admin UI: editör her çıktıyı düzenler/onaylar
       │
       ▼
   POST /api/v1/articles (published)
       │
       └─► Sonra: BullMQ jobs
           ├─ "newsletter-queue" → günlük "Pazarlama 5"
           ├─ "social-schedule" → LinkedIn/IG planla
           └─ "search-index" → Meilisearch
```

---

## 7. Veri akışı — örnek senaryolar

### A. Kullanıcı ana sayfayı ziyaret eder
```
1. Browser → markaradar.com (Vercel edge cache)
2. Next.js RSC server-side fetch:
   GET api.markaradar.com/api/v1/articles?status=published&limit=12
   GET api.markaradar.com/api/v1/articles/featured
   GET api.markaradar.com/api/v1/agencies?tier=featured&limit=8
3. NestJS Prisma query → Postgres
4. Redis cache (60s TTL) — popüler endpoint'lerde
5. HTML stream → browser
6. ISR revalidate 30s
```

### B. Kullanıcı haber okur (premium içerik)
```
1. Browser → markaradar.com/haber/X
2. Next.js RSC fetch:
   GET /api/v1/articles/X (cookie: mr_access)
3. NestJS:
   - User'ı çıkar (JWT)
   - Article tier kontrol → premium ise user.subscription kontrol
   - Premium değilse: { ...article, body: null, is_locked: true }
4. Web tarafı paywall component render
```

### C. Ajans review verir
```
1. Web → /ajans-rehberi/X/review/yeni
2. Form submit → POST /api/v1/agencies/X/reviews
3. NestJS:
   - Rate limit (Redis)
   - Email + LinkedIn validation
   - Insert review (status=pending)
   - BullMQ "review-verification" job
4. Worker:
   - Email doğrulama linki gönder (Resend)
   - LinkedIn URL fetch + parse
   - Reviewer şirketi e-posta domain'i ile match
   - Score → otomatik onay veya manuel kuyruğa
5. Admin moderasyon → onayla
6. Public görünür
```

### D. Premium üyelik satın alma
```
1. Web → /premium → tier seç (Pro $499/yıl)
2. POST /api/v1/subscriptions/checkout
   { tier: "pro", billing: "yearly" }
3. NestJS:
   - Stripe Checkout session oluştur (TR ise iyzico)
   - Return: { checkoutUrl }
4. Browser → Stripe checkout
5. Stripe webhook → POST /api/v1/webhooks/stripe
6. NestJS:
   - Signature verify
   - Subscription kaydı insert (status=active)
   - BullMQ "welcome-sequence" job
7. Worker: 7 günlük welcome e-posta serisi başlat
```

---

## 8. Yerel geliştirme — günlük rutin

```bash
# Sabah başlangıç
cd ~/Desktop/brand
docker compose up -d                    # postgres + redis + minio + mailhog

# 3 ayrı terminal:

# Terminal 1 — API
cd api && pnpm install && pnpm prisma migrate dev && pnpm start:dev
# → http://localhost:4000 (Swagger: /docs)

# Terminal 2 — Web
cd web && pnpm install && pnpm dev
# → http://localhost:3003

# Terminal 3 — Admin
cd admin && pnpm install && pnpm dev
# → http://localhost:3004

# Veya: Makefile shortcut
make dev                                # 3'ünü birden başlat (tmux veya concurrently)
```

---

## 9. Production deploy stratejisi

### Web + Admin → **Vercel** (öneri)
- Git push → otomatik deploy
- Preview deployments her PR'a
- Edge CDN, ISR otomatik
- Maliyet: $0 başlangıç, scale ile $20-100/ay

**Alternatif (self-hosted):**
- Sunucuda `pnpm build && pm2 start` ile çalıştır
- Nginx reverse proxy
- Cache layer eksik → daha düşük performans

### API → **Sunucu (PM2)**
- Mevcut sunucuda `/var/www/markaradar-api/`
- `pm2 list` ile yönetim (senin standardın)
- 2 cluster worker + 1 BullMQ worker
- Nginx: api.markaradar.com → 127.0.0.1:4000
- Postgres + Redis sistem servisi (paylaşımlı)

---

## 10. Frontend stack (web + admin ortak)

| Katman | Seçim | Sürüm |
|---|---|---|
| Framework | Next.js | **15+** (App Router, Turbopack) |
| UI library | React | **19** |
| Styling | Tailwind CSS | 4 |
| Component lib | shadcn/ui | latest |
| State | React Query (TanStack) | 5 |
| Forms | React Hook Form + Zod | latest |
| Editor | TipTap (admin için) | 2 |
| Charts | Recharts | latest |
| Analytics | PostHog + Plausible | — |
| Type-safety | TypeScript strict | 5+ |

### Next.js 15 öne çıkan özellikler
- **App Router** (Pages Router yok)
- **React Server Components default** — `'use client'` sadece interaktif yerlerde
- **Turbopack** (dev server hızlı)
- **Partial Prerendering** (PPR) — static shell + dynamic islands
- **after()** API — response sonrası async iş
- **Server Actions** — form submit doğrudan server function
- **next/image AVIF**, **next/font** zorunlu

### shadcn/ui yaklaşımı
- npm package değil, CLI ile kopyalanan source
- Tam kontrol, customize edilebilir
- Components: button, card, table, dialog, form, toast, tabs, dropdown, ...

---

## 11. API client (web ↔ api iletişim)

### Yaklaşım: thin REST client (axios veya fetch wrapper)

```typescript
// web/src/lib/api/client.ts
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  async get<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...opts,
      credentials: "include",  // cookie auth
      headers: { ...opts?.headers, "Content-Type": "application/json" },
      // RSC fetch için Next cache stratejisi:
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  }
  // post, put, delete ...
}
```

### Tip paylaşımı
- API DTO'larını **Zod schema** olarak yaz (api/ tarafında)
- `api/src/dto/` → otomatik OpenAPI schema üret
- Web tarafı: `openapi-typescript` ile types üret veya manuel kopyala
- Faz 2: gerçekten yorulduysak `tRPC` veya `oRPC` benzeri yaklaşım

**Alternatif (yüksek bağlanma):** tek monorepo'da `packages/shared-types/` ile direkt import. Şu an için fazla mühendislik.

---

## 12. Environment variables — özet

### `web/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
# Server-only:
RESEND_API_KEY=...           # (eğer next route handler içinden mail atılacaksa, yoksa api'de kalsın)
```

### `admin/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3004
```

### `api/.env.local`
```bash
# tüm tam liste için bkz: MarkaRadar_Backend_Plan.md
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://markaradar:dev_password_change_me@localhost:5434/markaradar_dev?schema=public
REDIS_HOST=localhost
REDIS_PORT=6390
S3_ENDPOINT=http://localhost:9110
S3_BUCKET=markaradar-media
S3_ACCESS_KEY=markaradar
S3_SECRET_KEY=dev_minio_password
JWT_SECRET=...
OPENAI_API_KEY=sk-...
RESEND_API_KEY=...
SMTP_HOST=localhost
SMTP_PORT=1030
CORS_ORIGINS=http://localhost:3003,http://localhost:3004
```

---

## 13. Sıralı kurulum komutları

```bash
cd ~/Desktop/brand

# 0. Docker'ı başlat (postgres + redis + minio + mailhog)
docker compose up -d
docker compose ps

# 1. API kur
cd api
pnpm install
cp .env.example .env.local
# .env.local içine API key'lerini gir
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm start:dev

# 2. Web kur (yeni terminal)
cd ../web
pnpm install
cp .env.example .env.local
pnpm dev

# 3. Admin kur (yeni terminal)
cd ../admin
pnpm install
cp .env.example .env.local
pnpm dev
```

---

## 14. İletişim & Cache stratejisi

### Cache katmanları
1. **Browser cache** — Cloudflare CDN edge
2. **Next.js cache** — RSC fetch revalidate (30-60s)
3. **API Redis cache** — popüler endpoint (article list 60s, agency list 5dk)
4. **Postgres** — son durak

### Invalidation
- Article published → Redis cache flush + Next.js revalidatePath('/')
- Premium content paywall → cache key user-aware OLMASIN, paywall component render time'da kontrol

### Rate limiting (api tarafı)
- Public endpoints: IP başına 100 req/dk
- Auth endpoints: IP başına 5 req/dk (brute force koruması)
- Webhook endpoints: signature verify, no rate limit

---

## 15. Karar bekleyen sorular

1. **web ve admin ayrı uygulama mı yoksa tek uygulama içinde route group'lar mı?**
   - **Öneri:** Ayrı (`web/` + `admin/`). Sebep: farklı deploy stratejisi, farklı auth davranışı, farklı bundle.
2. **Vercel mi self-hosted mu (web+admin için)?**
   - **Öneri:** Vercel (developer experience + edge cache). Faz 2'de gerekirse self-host.
3. **API'de Swagger açık mı kalsın?**
   - **Öneri:** Dev'de açık (`/docs`), prod'da kapalı veya basic auth ile korumalı.
4. **WebSocket gerekli mi (AI üretim progress için)?**
   - **Öneri:** Faz 1'de polling yeterli (5sn'de 1). Faz 2'de Socket.IO ekle.

---

## 16. Bu mimari neden böyle?

| Karar | Sebep | Trade-off |
|---|---|---|
| Modüler monolit (api) | Hız, deploy basit, küçük takım | Scale'de mikroservis'e geçmek gerekebilir (5M+ trafik) |
| Next.js 15 App Router | SEO + dynamic + RSC | Pages Router'a göre öğrenme eğrisi |
| Web + Admin ayrı | Bağımsız deploy, izolasyon | Kod tekrarı (UI components) |
| Prisma vs TypeORM | Type-safety + migration UX | Raw SQL gerektiğinde escape hatch lazım |
| PM2 (Docker yok prod) | Sistemin diğer projeleriyle uyumlu | Container portabilite yok |
| Stripe + iyzico | Hem global hem TR ödeme | İki webhook handler, iki sözleşme |
| Beehiiv (newsletter platform) | Sponsorship + abone büyütme araçları | API limitleri, vendor lock-in |
| pnpm | Hızlı, disk verimli | npm ekosistemine göre nadiren tooling sorunu |

---

**Sıradaki adım:** Bu mimariyi onaylayınca → `api/`, `web/`, `admin/` iskeletlerini oluşturuyorum. Her birinin `package.json`, `tsconfig`, temel klasör yapısı, ve örnek bir endpoint/sayfa hazır gelecek.
