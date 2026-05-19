# MarkaRadar Backend — Derinlemesine Analiz

**Tarih:** Mayıs 2026
**Kapsam:** Sadece `api/` klasörü
**Mevcut:** 1.070 satır TypeScript + Prisma, 7 modül (auth, users, content, health, prisma, redis, config)
**Hedef:** Strateji dokümanlarındaki tüm özellikleri taşıyabilecek production-grade backend
**Format:** Bulgu → Etki → Öneri → Öncelik

---

## 🔴 KRİTİK BULGULAR (production'a çıkmadan önce halledilmeli)

### 1. Refresh token rotation tamamen eksik
**Durum:** `RefreshToken` tablosu schema'da var, ancak hiçbir kodda kullanılmıyor. `auth.service.ts` refresh token üretiyor ama veritabanına yazmıyor; `/auth/refresh` endpoint'i yok.

**Etki:**
- Token çalınırsa iptal edilemez (30 gün geçerli kalır)
- "Bu cihazdan çıkış yap" özelliği imkansız
- Refresh token rotation güvenlik standardı uygulanmıyor (OWASP önerisi)

**Öneri:**
- `auth.service` içinde `RefreshToken` insert et (hash'lenmiş + user_agent + ip)
- `/api/v1/auth/refresh` endpoint ekle: eski tokeni `revokedAt`'la, yenisini insert et
- Logout'ta tüm aktif refresh tokenları revoke et
- Şifre değişiminde tüm sessionları sonlandır

**Öncelik:** 🔴 P0 — Sprint 2'de mutlaka

---

### 2. Global exception filter yok — hata yanıtları tutarsız
**Durum:** `main.ts`'de filter register edilmiyor. Hatalar Nest'in varsayılan formatında dönüyor; iç hatalar 500 olarak geliyor (BigInt hatasında olduğu gibi — debug zordu).

**Etki:**
- Prisma `P2002` (unique constraint) → 500 olarak dönüyor, frontend friendly mesaj alamıyor
- KVKK/audit log eksik (kim hangi hatayı tetikledi)
- Error responses farklı şekilde geliyor (validation errors vs internal errors farklı format)

**Öneri:**
```typescript
// src/common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception, host) {
    // Prisma errors → 400/409 mapping
    // Validation → 422
    // HttpException → status from exception
    // Diğer → 500, Sentry'e logla
    // Tutarlı format: { statusCode, errorCode, message, details, traceId }
  }
}
```
- `app.useGlobalFilters(new AllExceptionsFilter())` ekle
- Sentry entegrasyonu ile birleştir

**Öncelik:** 🔴 P0

---

### 3. Roles guard yok — yetki kontrolü tamamen eksik
**Durum:** `JwtAuthGuard` var ama `RolesGuard` yok. `@Roles("super_admin")` decorator'u tanımlanmamış. Admin-only endpoint koruması yok.

**Etki:**
- Eğer admin endpoint'leri (article CRUD, ajans yönetimi) eklersek, sıradan bir user da çağırabilir
- Premium içerik kontrolü (tier-based) yapılamıyor
- Multi-role yapısı (editor/writer/social_manager/sales) işlevsiz

**Öneri:**
```typescript
// common/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// common/guards/roles.guard.ts — JWT'den user.role, metadata'dan required roles
// Controller'lara @UseGuards(JwtAuthGuard, RolesGuard) @Roles('editor')
```

**Öncelik:** 🔴 P0

---

### 4. CORS + cookie config production-ready değil
**Durum:**
- `main.ts` `app.enableCors({ origin, credentials: true })` — origin array boşsa `true` dönüyor (her domain'e açık)
- Cookie `domain: 'localhost'` — production'da `.markaradar.com` olması gerekir
- `sameSite: 'lax'` — admin subdomain için problem yaratabilir

**Etki:**
- Prod'da subdomain'ler arası cookie paylaşımı çalışmaz (admin.markaradar.com → markaradar.com)
- Boş origin durumunda CSRF riski

**Öneri:**
- Production'da `origin: corsOrigins` zorunlu, fallback `true` OLMASIN
- Cookie domain dinamik (`.markaradar.com` prod, `localhost` dev)
- CSRF token mekanizması veya state-changing endpoint'lerde sameSite=strict + double-submit cookie

**Öncelik:** 🔴 P0

---

### 5. BigInt fix main.ts'de — anti-pattern
**Durum:** `BigInt.prototype.toJSON` global olarak patch'lendi. Çalışıyor ama:
- Global mutation, test ortamında sürprizler verebilir
- Tüm BigInt'ler string'e dönüyor — frontend `Number(viewCount)` yapmak zorunda
- TypeScript tarafı bunu bilmiyor (string mi number mi belirsiz)

**Etki:**
- Article list `viewCount: "12345"` (string) dönüyor; frontend sıralama yaparsa string sort hatası
- Database'de 9 quadrillion'a kadar varma ihtimali var, ama gerçekçi olarak makaleler için Int yeter

**Öneri (3 alternatif):**
1. **Schema değiştir:** `viewCount BigInt` → `Int` (2.1 milyar yeter, makaleler için yeterli)
2. **Service'te serialize et:** `articles.service.ts` içinde `Number(article.viewCount)` döndür
3. **Interceptor yaz:** `BigIntInterceptor` ile RxJS map ile dönüştür — global ama net

→ Öneri: **(1)** — schema'da `Int` yap, BigInt polyfill'i sil

**Öncelik:** 🟡 P1

---

### 6. Webhook endpoint koruması düşünülmemiş
**Durum:** Stripe/iyzico/Beehiiv webhook endpoint'leri yok ama planlanıyor. Mevcut `app.module.ts`'de `ValidationPipe` ve `bodyParser` ayarları webhook signature verification için sorun çıkaracak.

**Etki:**
- Webhook ham body gerektirir; varsayılan JSON parse signature'ı kıracak
- CORS varsayılan ayar webhook'ları engelleyebilir

**Öneri:**
- `main.ts`'de `app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }))` ekle
- Webhook route'larında ayrı `RawBodyMiddleware`
- `ThrottlerGuard` webhook'ları SKIP etmeli

**Öncelik:** 🟡 P1 (subscription modülü gelmeden önce)

---

## 🟡 ÖNEMLİ EKSİKLER (sprint 2-4'te halledilmeli)

### 7. Email verification + password reset akışı yok
**Durum:** Register sonrası user `emailVerified: false` ama doğrulama linki gönderen kod yok. Şifre sıfırlama endpoint'i yok.

**Etki:**
- KVKK uyumu eksik (kullanıcı kimlik doğrulaması)
- Fake hesaplar açılabilir
- Şifresini unutan kullanıcı geri dönemez

**Öneri:**
- `EmailVerificationToken` ve `PasswordResetToken` tablolarını schema'ya ekle (kısa ömürlü, 1 saat)
- `/auth/send-verification`, `/auth/verify`, `/auth/forgot-password`, `/auth/reset-password` endpoint'leri
- Mail modülü ile entegre (Resend prod, MailHog dev)

**Öncelik:** 🟡 P1 — Sprint 2

---

### 8. Pagination standart değil
**Durum:** `articles.controller.ts` query params: `limit`, `offset` — string olarak alıyor, manuel parse ediyor. DTO yok. Default değerler service'te.

**Etki:**
- Validation yok (negatif limit, çok büyük limit hata vermiyor — sadece service cap'liyor)
- Diğer modüllerde tutarsız pagination beklenecek
- Cursor-based pagination yapısı yok (büyük listede offset yavaş)

**Öneri:**
```typescript
// common/dto/pagination.dto.ts
export class PaginationDto {
  @IsOptional() @IsInt() @Min(1) @Max(100) @Type(() => Number)
  limit: number = 20;

  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  offset: number = 0;
}

// İleride: CursorPaginationDto { cursor, limit }
```
- Tüm liste endpoint'leri buna uysun

**Öncelik:** 🟡 P1

---

### 9. Cache hiç kullanılmıyor
**Durum:** `RedisService` var, sadece health check'te kullanılıyor. Articles list / detail cache yok.

**Etki:**
- Her ana sayfa açılışı DB'ye gidiyor (yoğunlukta sıkıntı yaratır)
- Premium content paywall hesabı her seferinde Prisma query
- Strateji 5M aylık trafik diyor — şu yapı 100K aylıkta zorlanır

**Öneri:**
```typescript
// Articles service:
async list(params) {
  const cacheKey = `articles:list:${hash(params)}`;
  const cached = await this.redis.get(cacheKey);
  if (cached) return cached;
  const result = await ...;
  await this.redis.set(cacheKey, result, 60); // 60s TTL
  return result;
}

// Invalidation: article published → SCAN articles:list:* DEL
```
- Yazılı bir CacheInterceptor decorator pattern'ı: `@Cache(60)` controller method'a

**Öncelik:** 🟡 P1 — Sprint 3

---

### 10. View count race condition
**Durum:** `articles.service.ts:74` — `this.prisma.article.update({ data: { viewCount: { increment: 1 } } })` fire-and-forget olarak çağrılıyor.

**Etki:**
- Article her okunduğunda DB UPDATE — yoğun trafikte Postgres yazma yükü
- Fire-and-forget hata yutuluyor (catch boş)
- Aynı kullanıcı 10 kere refresh → 10 increment (anlamsız metric)

**Öneri (sıralı):**
1. Yakın vadeli: Redis'te counter (`INCR article:views:{id}`) — günlük batch ile DB'ye sync
2. Orta vadeli: `analytics_events` tablosuna gerçek event yaz; `viewCount` denormalize column olarak günlük UPDATE
3. Uzun vadeli: PostHog gibi product analytics → backend hiç tutmaz

**Öncelik:** 🟡 P1

---

### 11. Storage modülü iskeleti var ama implementation yok
**Durum:** `src/shared/storage/` klasörü bile yok aslında. `@aws-sdk/client-s3` dependency var ama servis yazılmamış.

**Etki:**
- Editör makale yazarken kapak görseli yükleyemez
- AI üretilen görseller bir yere kaydedilemez
- User avatar upload yok

**Öneri:**
```typescript
// shared/storage/storage.service.ts
- presignedUploadUrl(key, contentType, expiresIn)
- presignedDownloadUrl(key, expiresIn)
- upload(buffer, key, contentType)
- delete(key)
- listByPrefix(prefix)
```
- MinIO (dev) ve R2 (prod) için aynı API
- Image resize için Sharp ek modülü

**Öncelik:** 🟡 P1 — Sprint 3 (admin'in görsel yüklemesi için kritik)

---

### 12. Mail modülü yok
**Durum:** `Resend` dependency var, kod yok. Yerel MailHog ayağı var ama bağlanan yok.

**Etki:**
- Welcome e-postası gönderilemez
- Email verification gönderilemez
- Newsletter çalışmaz
- Şifre sıfırlama gönderilemez

**Öneri:**
```typescript
// shared/mail/mail.service.ts
- send({ to, subject, html, text, template, vars })
- Driver: SMTP (yerel MailHog) | Resend (prod)
- Template engine: MJML veya React Email
```
- Queue üzerinden gönderim (BullMQ — retry, dead letter)

**Öncelik:** 🟡 P1 — Sprint 2'de

---

### 13. BullMQ queue altyapısı yok
**Durum:** `bullmq` paketi yüklü, `QUEUE_REDIS_DB=1` env'de tanımlı. Ancak queue/worker kodu yok.

**Etki:**
- AI uzun süreli üretim sync olarak yapılır (timeout)
- Mail gönderim sync (kullanıcı bekler)
- Sosyal medya zamanlama yapılamaz
- Dunning, welcome sequence vb yapılamaz

**Öneri:**
```
shared/queue/
├── queue.module.ts            # BullModule.forRoot Redis bağlantı
├── queue.service.ts           # wrapper: addJob, getJob, removeJob
└── processors/                # her queue için ayrı worker
    ├── ai.processor.ts
    ├── mail.processor.ts
    ├── social.processor.ts
    └── newsletter.processor.ts
```
- Ayrı `worker.ts` entry point (PM2'de separate process)

**Öncelik:** 🟡 P1 — Sprint 3-4

---

### 14. AI modülü yok
**Durum:** OpenAI/Anthropic dependency'leri eklendi ama hiç kod yok. Strateji dokümanlarında 8 format üretici prompt var, hiçbiri implement edilmedi.

**Etki:**
- Ürünün **ana diferansiyasyon noktası** çalışmıyor
- Editör AI Studio'yu kullanamaz

**Öneri:**
```
modules/ai/
├── ai.module.ts
├── ai.service.ts              # orchestrator: kaynak gir → 8 format
├── providers/
│   ├── openai.provider.ts
│   ├── anthropic.provider.ts
│   └── gemini.provider.ts
├── prompts/                   # MarkaRadar_v2_Hibrit_Strateji.md 8.x'teki şablonlar
│   ├── title.prompt.ts
│   ├── body.prompt.ts
│   ├── ai-summary.prompt.ts
│   ├── linkedin-post.prompt.ts
│   ├── instagram-carousel.prompt.ts
│   ├── reels-script.prompt.ts
│   ├── seo-meta.prompt.ts
│   └── cover-image.prompt.ts
├── cost-tracker.service.ts    # ai_generations log + monthly budget guard
└── ai.controller.ts           # POST /api/v1/ai/generate (queue'ya ekler)
```
- BullMQ ile uzun süreli işlere ekle
- Cache: aynı source URL için 7 günlük cache

**Öncelik:** 🟡 P1 — Sprint 4 (Sprint planındaki gibi)

---

### 15. ai_generations tablosu schema'da yok
**Durum:** Strateji dokümanı bu tabloyu zorunlu kılıyor (AI cost tracking, audit). Mevcut `schema.prisma`'da yok.

**Etki:**
- AI maliyetini izleyemiyoruz
- Editör onayı/red sayıları yok
- Hangi prompt başarılı izlenemez

**Öneri:** Schema'ya ekle:
```prisma
model AiGeneration {
  id              String   @id @default(uuid()) @db.Uuid
  articleId       String?  @map("article_id") @db.Uuid
  generationType  String   @map("generation_type") @db.VarChar(50)
  prompt          String   @db.Text
  output          String   @db.Text
  model           String   @db.VarChar(80)
  promptTokens    Int      @map("prompt_tokens")
  outputTokens    Int      @map("output_tokens")
  costUsd         Decimal  @map("cost_usd") @db.Decimal(10, 4)
  durationMs      Int      @map("duration_ms")
  status          String   @default("success") @db.VarChar(30)
  createdById     String?  @map("created_by") @db.Uuid
  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@index([articleId])
  @@index([createdAt(sort: Desc)])
  @@map("ai_generations")
}
```

**Öncelik:** 🟡 P1

---

### 16. Test altyapısı 0
**Durum:** `package.json`'da `vitest` script var, ancak hiçbir test dosyası yok. Vitest config dosyası yok.

**Etki:**
- Refactor güveni yok
- Regresyon riski yüksek
- CI pipeline kurulamaz

**Öneri:** Hızlı kazanım için kritik path'leri test et:
- `auth.service.spec.ts` — register/login/wrong password
- `articles.service.spec.ts` — list/get/not found
- E2E: `/auth/login → /users/me` round trip

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite({ jsc: { parser: { syntax: 'typescript', decorators: true }, transform: { legacyDecorator: true, decoratorMetadata: true } } })],
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
```

**Öncelik:** 🟡 P1 — Sprint 2'den itibaren her PR ile test yaz

---

## 🟢 İYİLEŞTİRMELER (genel kod kalitesi)

### 17. DTO tip tutarsızlıkları
**Durum:**
- `LoginDto` `MinLength(8)` — register'da da 8, ama JWT_SECRET'da farklı min length
- `RegisterDto.fullName` `MaxLength(150)` — DB schema 150 (uyumlu, ama coupled)
- `articles.controller.ts` `@Query('limit')` string, manuel `Number()`

**Öneri:**
- Schema'dan tip generate et veya tek kaynak (Zod schemas)
- Constants olarak `MIN_PASSWORD_LENGTH = 8` shared bir yerde
- Tüm query DTO'ları için `@Type(() => Number)`

---

### 18. JWT secret rotation stratejisi yok
**Durum:** Tek JWT_SECRET var. Rotated edilirse tüm token'lar geçersiz olur.

**Öneri:**
- `kid` (key ID) header'ı kullanan dual secret yapısı
- Veya: kısa expiry (15dk) + refresh token rotation — şu an refresh broken, bu çözülünce sorun azalır

**Öncelik:** 🟢 P2

---

### 19. Audit log yok
**Durum:** Kim ne yaptı (article published, user role changed, agency premium tier upgraded) izlenmiyor.

**Öneri:**
```prisma
model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  actorId     String?  @map("actor_id") @db.Uuid
  action      String   @db.VarChar(80)        // article.publish, user.role_change
  resource    String   @db.VarChar(50)        // article, user, agency
  resourceId  String?  @map("resource_id")
  changes     Json?                            // before/after diff
  ipAddress   String?  @map("ip_address") @db.VarChar(45)
  userAgent   String?  @map("user_agent") @db.VarChar(500)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz()
  @@index([actorId, createdAt(sort: Desc)])
  @@index([resource, resourceId])
}
```
- Interceptor olarak yazılabilir (@Auditable decorator + AuditInterceptor)

**Öncelik:** 🟢 P2 (KVKK için faz 2 öncesi şart)

---

### 20. Health endpoint zayıf
**Durum:** `/health` sadece DB+Redis kontrol ediyor. K8s style liveness/readiness ayrımı yok.

**Öneri:**
- `/health` (liveness — sadece app ayakta mı)
- `/health/ready` (readiness — DB+Redis+downstream APIs)
- `@nestjs/terminus` kullan: HTTP, disk, memory check eklenebilir

**Öncelik:** 🟢 P2

---

### 21. Logger PII redaction yetersiz
**Durum:** `app.module.ts` Pino redact: `authorization`, `cookie` — ama body'deki şifre, e-posta, telefon redact edilmiyor.

**Öneri:**
```typescript
redact: {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.body.password',
    'req.body.passwordHash',
    'req.body.refreshToken',
    '*.password',
    '*.token',
    '*.secret',
  ],
  censor: '[REDACTED]',
}
```

**Öncelik:** 🟡 P1 (KVKK için)

---

### 22. Database connection pool ayarı yok
**Durum:** `DATABASE_URL` connection_limit parametresi default Prisma değerinde. Prod'da ortalama 10 — 2 PM2 instance × 10 conn = 20, ama burst trafikte yetmez.

**Öneri:**
- `.env.production`: `DATABASE_URL=...?connection_limit=30&pool_timeout=10`
- Postgres tarafında `max_connections` yeterli olmalı (bizim user için ayrı limit)
- PgBouncer (faz 2): transaction-pooling mode

**Öncelik:** 🟢 P2 — prod'a çıkmadan önce

---

### 23. Prisma client tek instance global ama OnModuleDestroy yetersiz
**Durum:** `PrismaService` `$connect`/`$disconnect` yapıyor — graceful shutdown çoğunlukla çalışıyor ama PM2 reload sırasında in-flight request'ler kesilebilir.

**Öneri:**
- `main.ts`'de `app.enableShutdownHooks()` ZATEN VAR mı? — HAYIR, eksik. Eklenmeli.
- PM2 `kill_timeout: 5000` ayarlanmış (iyi)
- Prisma'nın `$on('beforeExit')` callback'i — graceful drain

**Öncelik:** 🟡 P1

```typescript
// main.ts'e ekle:
app.enableShutdownHooks();
```

---

### 24. Article body'si HTML olarak frontend'e gidiyor — XSS riski
**Durum:** `articles.service.ts` `body: string` raw geliyor. Frontend `dangerouslySetInnerHTML` kullanıyor.

**Etki:**
- TipTap editor admin'den kontrol altında giriyor ama sanitization yapılmıyor
- Birisi DB'ye doğrudan zararlı HTML yazarsa → stored XSS

**Öneri:**
- Backend'de sanitize-html ile temizle yazarken (insert before storage)
- Frontend'de DOMPurify ile temizle render zamanı
- İdeal: **ikisi de** (defense in depth)

**Öncelik:** 🟡 P1

---

### 25. Slug üreteci yok — admin makale eklerken çakışabilir
**Durum:** Article CRUD admin endpoint'i yok ama eklenecek. Slug unique constraint var, çakışma `P2002` fırlatır.

**Öneri:**
- `common/utils/slug.ts`:
```typescript
export async function generateUniqueSlug(prisma, base) {
  const slug = slugify(base, { lower: true, strict: true, locale: 'tr' });
  let candidate = slug;
  let n = 0;
  while (await prisma.article.findUnique({ where: { slug: candidate } })) {
    n++;
    candidate = `${slug}-${n}`;
  }
  return candidate;
}
```
- Türkçe diacritic için `slugify` ya `slug` paketleri (locale: 'tr')

**Öncelik:** 🟡 P1 — Article CRUD yazılırken

---

### 26. API versioning hardcoded — `/api/v1` her yerde tek
**Durum:** `main.ts` `setGlobalPrefix('api/v1')`. Nest'in `enableVersioning` özelliği kullanılmıyor.

**Etki:**
- v2 endpoint eklemek istendiğinde karmaşık
- Aynı endpoint'in iki versiyonu paralel kalamaz

**Öneri:**
```typescript
app.setGlobalPrefix('api');
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
// Controller'da: @Controller({ version: '1', path: 'articles' })
```

**Öncelik:** 🟢 P2 — şu an erken (v1 yeterli)

---

### 27. Swagger production'da kapalı ama auth ile açık tutulmuyor
**Durum:** Production'da `/docs` tamamen kapatılıyor. Bazen oldukça yararlıdır.

**Öneri:**
- `basic-auth` ile gate'le: `app.use('/docs', basicAuth({ users: { admin: process.env.SWAGGER_PASSWORD } }))`
- Veya: prod'da `/internal-docs` ayrı path + IP allowlist (Cloudflare seviyesinde)

**Öncelik:** 🟢 P2

---

### 28. Throttler global ama auth endpointlerinde sıkı değil
**Durum:** Tüm endpoint'lere 100 req/dk. Login endpoint'i için bu çok fazla (brute force riski).

**Öneri:**
```typescript
@Throttle({ short: { limit: 5, ttl: 60000 } })  // auth controller method'lara
@Post('login')
```
- Veya app.module.ts'de multiple throttler config: `short`, `medium`, `long`

**Öncelik:** 🟡 P1

---

### 29. Cookie SameSite kararı net değil
**Durum:** Hep `lax` — admin (subdomain) ve web ayrı subdomain'lerse cookie paylaşımı problemli.

**Etki:**
- `markaradar.com` (web) ve `admin.markaradar.com` (admin) farklı domain'ler değil ama path/cookie sharing
- Cross-site request'lerde (e.g. Stripe → markaradar.com checkout return) `lax` çoğunlukla çalışır ama edge case'ler var

**Öneri:**
- Cookie `domain: '.markaradar.com'` (prod) → subdomain'ler paylaşır
- `sameSite: 'lax'` 95% case için yeterli
- Stripe redirect gibi cross-site POST → ayrı flow

**Öncelik:** 🟡 P1 — prod'a çıkarken

---

### 30. `env.validation.ts` Zod kullanımı NestJS validate ile çakışıyor (subtle)
**Durum:** ConfigModule `validate: validateEnv` kullanıyor. Zod parse ediliyor ama Nest Config beklediği şekilde unknown→typed dönmüyor. ConfigService.get<string>('PORT', 4000) hala string dönebilir.

**Öneri:**
- Zod'dan tipli config helper yaz:
```typescript
// config/config.service.ts (custom)
@Injectable()
export class TypedConfigService {
  constructor(private readonly raw: ConfigService) {}
  get<K extends keyof Env>(key: K): Env[K] {
    return this.raw.get(key) as Env[K];
  }
}
```
- Veya `nestjs-zod` paketi

**Öncelik:** 🟢 P2 (kozmetik, fonksiyonel çalışıyor)

---

### 31. Prisma migration history sunucuya kopyalanmamış olabilir
**Durum:** `.gitignore`'da `prisma/migrations/dev.db*` excluded ama `migrations/` klasörü dahil. İyi. Ama `migration_lock.toml` mevcut mu?

**Kontrol:**
```bash
ls api/prisma/migrations/
# 20260513175656_init/ + migration_lock.toml olmalı
```

**Öneri:**
- Migration_lock.toml mutlaka commit
- Schema değişikliğinden sonra her seferinde `prisma migrate dev` (CI tarafında validate)
- `migrate deploy` prod'da hiç prompt sormaz

**Öncelik:** 🟢 P2 (validasyon)

---

### 32. Logger correlation ID yok
**Durum:** Her request'in unique ID'si yok. Log'lardan trace edilemiyor.

**Öneri:**
- nestjs-pino `genReqId` ile UUID generate
- Header'da `X-Request-Id` döndür (frontend hata raporlamasında)
- Pino otomatik request log'ları ekliyor — ID korelasyon için

**Öncelik:** 🟢 P2

---

### 33. Sentry entegrasyonu boş
**Durum:** `SENTRY_DSN` env tanımlı, kod yok. `@sentry/node` paketi bile eklenmemiş.

**Öneri:**
```typescript
// main.ts başında
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```
- `AllExceptionsFilter` içinde `Sentry.captureException(error)`

**Öncelik:** 🟡 P1 — prod öncesi

---

## 📊 STRATEJİ DOKÜMANI vs MEVCUT KOD — KAPSAMA HARITASI

| Strateji modülü | Schema | Service | Controller | BullMQ | Notlar |
|---|---|---|---|---|---|
| users + auth | ✅ | ✅ kısmi | ✅ kısmi | — | refresh broken |
| content (articles) | ✅ | ✅ kısmi | ✅ public | — | admin CRUD yok |
| categories | ✅ | — | — | — | endpoint yok |
| tags | ✅ | — | — | — | endpoint yok |
| **ai_generations** | ❌ | ❌ | ❌ | ❌ | tamamen yok |
| **media** (upload) | — | ❌ | ❌ | — | storage yok |
| **agencies** | ❌ | ❌ | ❌ | — | tamamen yok |
| **agency_reviews** | ❌ | ❌ | ❌ | ❌ | tamamen yok |
| **jobs** | ❌ | ❌ | ❌ | — | tamamen yok |
| **employer_brands** | ❌ | ❌ | ❌ | — | tamamen yok |
| **ads** | ❌ | ❌ | ❌ | — | tamamen yok |
| **newsletter** | ❌ | ❌ | ❌ | ❌ | beehiiv API yok |
| **subscriptions** | ❌ | ❌ | ❌ | ❌ | stripe/iyzico yok |
| **courses** (akademi) | ❌ | ❌ | ❌ | — | tamamen yok |
| **events + awards** | ❌ | ❌ | ❌ | — | tamamen yok |
| **reports** | ❌ | ❌ | ❌ | — | tamamen yok |
| **research_panel** | ❌ | ❌ | ❌ | — | tamamen yok |
| **community** (slack) | ❌ | ❌ | ❌ | — | tamamen yok |
| **social** (LinkedIn) | ❌ | ❌ | ❌ | ❌ | tamamen yok |
| **analytics_events** | ❌ | ❌ | — | — | tamamen yok |
| **audit_logs** | ❌ | ❌ | — | — | tamamen yok |
| **webhooks** | ❌ | ❌ | ❌ | — | endpoint yapısı yok |

**Kapsama:** ~7% (1 endpoint paterni, 1 schema set, 1 auth flow)

---

## 🗺️ ÖNERİLEN YOL HARİTASI — Yeniden Sıralama

Strateji'deki 8 sprintlik plan iyi ama **bağımlılık sırası** yanlış. Yapısal eksikleri önce çözmeli, sonra feature'lar.

### Sprint 1.5 — "Foundation pekiştirme" (1 hafta)
Yeni sprint, mevcut Sprint 2'den önce:
- ✅ Global ExceptionFilter + Sentry
- ✅ RolesGuard + @Roles decorator
- ✅ PaginationDto (shared)
- ✅ Slug üreteci
- ✅ ShutdownHooks + Prisma cleanup
- ✅ Logger PII redaction
- ✅ Auth endpoint için sıkı throttler
- ✅ CORS prod-safe
- ✅ Vitest config + 3 örnek test
- ✅ AuditLog tablosu + interceptor
- ✅ ai_generations tablosu (boş, AI modülüne hazır)

### Sprint 2 — Auth tamamlama
- Refresh token rotation
- Email verification
- Password reset
- Roles enforcement

### Sprint 3 — Storage + Media + Admin Content CRUD
- StorageService (MinIO/R2 abstract)
- Image upload + Sharp resize
- Article admin CRUD
- Category/Tag admin CRUD
- Cache layer (Redis)

### Sprint 4 — AI Pipeline
- BullMQ kurulumu + ayrı worker process
- AI providers (OpenAI/Anthropic)
- 8 format generator
- Cost tracker + budget guard
- ai_generations log

### Sprint 5 — Newsletter
- Beehiiv API entegrasyonu
- Subscriber CRUD + double opt-in
- Newsletter issue compose (AI ile)
- Webhook handler

### Sprint 6 — Agencies + Verified Reviews
- Agency CRUD
- Review submission + verification flow
- Moderation queue
- Right to reply
- Anti-fraud

### Sprint 7 — Subscriptions + Payment
- Stripe + iyzico
- Webhook handlers
- Subscription state machine
- Dunning + winback

### Sprint 8 — Jobs + Reports + Polish
- Jobs CRUD + employer brand
- Report file delivery
- Analytics dashboard endpoints
- Production hardening

---

## 🛡️ GÜVENLİK CHECKLIST — Şu Anki Durum

| Kontrol | Durum | Notlar |
|---|---|---|
| HTTPS zorunlu | ⏳ | Prod'da Nginx + Let's Encrypt (henüz prod yok) |
| Helmet | ✅ | main.ts'de aktif |
| CORS allowlist | 🟡 | Boş array fallback'i `true` → kapatılmalı |
| Cookie httpOnly + Secure | 🟡 | Secure dev'de false (doğru), prod'da true (var) |
| Cookie SameSite | 🟡 | lax — subdomain için yeniden değerlendir |
| CSRF protection | ❌ | Yok — state-changing endpoint'lerde lazım |
| Rate limit (global) | ✅ | Throttler aktif |
| Rate limit (auth) | ❌ | Login 100 req/dk fazla — 5 req/dk olmalı |
| Password hashing | ✅ | bcrypt 12 round |
| JWT signing key | ✅ | 96 char random (üretildi) |
| JWT short expiry | ✅ | 15dk access |
| Refresh token rotation | ❌ | Schema var, kod yok |
| Token blacklist | ❌ | Logout token'ı geçersiz kılmıyor |
| SQL injection | ✅ | Prisma parametrize |
| Mass assignment | ✅ | ValidationPipe whitelist + forbidNonWhitelisted |
| XSS (output) | 🟡 | Article body sanitize edilmiyor |
| Secrets in env | ✅ | .env.local/.env gitignored |
| Secret rotation | ❌ | Tek anahtar, rotation yok |
| Audit log | ❌ | Yok |
| KVKK rıza tracking | ❌ | Yok |
| PII log redaction | 🟡 | Yetersiz |
| Webhook signature | ❌ | Endpoint yok ama hazırlık yok |
| Brute force protection | 🟡 | Throttler var, account lockout yok |
| Email verification | ❌ | Flag var, akış yok |

---

## ⚡ PERFORMANS NOTLARI

| Konu | Şu an | Hedef | Aksiyon |
|---|---|---|---|
| DB connection pool | Default (~10) | 30 | DATABASE_URL'e ekle |
| Query N+1 | Yok (include kullanılıyor) | Korumalı | Prisma Studio ile EXPLAIN |
| Redis cache | Kullanılmıyor | Public list 60s, detail 5dk | Sprint 1.5 |
| ISR (Next.js) | Web'de var | Bütün public sayfa | OK |
| CDN | Yok | Cloudflare | Prod'da |
| Image optimization | Yok | Sharp + WebP/AVIF | Sprint 3 |
| BullMQ | Yok | Worker ayrı process | Sprint 4 |
| Full-text search | Postgres `tsvector` | Meilisearch (faz 2) | İlerleyen sprint |
| Static asset caching | Yok | Cache-Control headers | Nginx tarafı |

---

## 📐 MIMARI KARARLAR — Yeniden Değerlendirme

| Karar | Sebep (öncelikli) | Endişe | Tutalım mı? |
|---|---|---|---|
| Modüler monolit | Hız, basitlik | 5M+ trafik | ✅ Tut, ölçek anında ayrı |
| Prisma | DX, type-safe | Raw SQL escape hatch | ✅ Tut, $queryRaw açık |
| PM2 (Docker yok prod) | Diğer projelerle uyum | Image portability | ✅ Tut |
| JWT in httpOnly cookie | XSS koruma | CSRF riski | ✅ Tut, CSRF token ekle |
| pnpm → **yarn** | Kullanıcı tercihi | yarn 4'e geçilebilir | ✅ Yarn 1 yeter (yarn 4 sonra) |
| NestJS over Fastify | Mature ecosystem | Express slower | ✅ Tut, Fastify adapter opsiyonel |
| Single repo, 3 app | Bağımsız deploy | Type sharing manuel | ✅ Tut, faz 2'de monorepo |

---

## 🎯 BÜYÜK PİCİTURE — Eksik Olan En Önemli Şey

**Tek cümlede:** *Mevcut backend, strateji dokümanındaki ürünün %7'sini taşıyor; ama daha kötüsü, kalan %93'ü destekleyecek **yapısal temel** (worker, storage, mail, cache, exception filter, roles, audit) henüz kurulmamış.*

Bu nedenle bir sonraki sprintte direkt feature yazmak yerine, **Sprint 1.5: Foundation pekiştirme** çok ciddi geri dönüş verir. 1 haftalık altyapı yatırımı, sonraki 7 sprint'i 2-3x hızlandırır.

---

## 🟢 İYİ OLAN ŞEYLER (gözden kaçırmayalım)

- Modül yapısı temiz, NestJS konvansiyonları doğru
- Prisma schema'sı strateji'ye uygun (kısmi) ve indexler düşünülmüş
- Env validation Zod ile sağlam
- Pino logger structured, transport pretty dev'de
- Health check DB+Redis kontrolü var
- Swagger dev'de açık, cookie auth tanımlı
- Helmet + CORS + cookie-parser + throttler register edilmiş
- BigInt fix patch'lendi (geçici çözüm ama çalışıyor)
- Seed datası ile dev experience iyi
- Docker compose temiz, port çakışması yok
- PM2 ecosystem.config hazır (worker eklenecek)
- `.env.example` kapsamlı

---

## 🚦 İLK 3 GÜN ÖNERİSİ — Hemen Bu Hafta

**Gün 1 — Foundation 1**
- `AllExceptionsFilter` + Sentry init
- `RolesGuard` + `@Roles` decorator
- `PaginationDto`
- Auth endpoint throttler (5 req/dk)

**Gün 2 — Foundation 2**
- Refresh token rotation
- Email verification akışı (token tablosu + endpoint)
- MailService (SMTP yerel, Resend prod)
- Cookie domain/sameSite production-safe

**Gün 3 — Foundation 3**
- StorageService (MinIO + presigned URL)
- Slug üreteci
- Audit log interceptor
- ShutdownHooks + graceful drain
- İlk 5 vitest e2e

Bu 3 gün, sonraki tüm sprintleri çok daha hızlı yapar.

---

**Sıradaki adım için karar:** Bu eksiklerin hangilerini önce halledelim? Önerim "Foundation Sprint 1.5" — yukarıdaki gün 1-3'ü ardarda yapmak. Onaylarsan kodlamaya başlıyorum.
