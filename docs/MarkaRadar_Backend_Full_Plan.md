# MarkaRadar Backend — Full Feature Map + Dünya Örnekleri + Hibrit Mimari

**Tarih:** Mayıs 2026
**Kapsam:** Backend'in tamamlanması için gerekli tüm özellikler + dünya örneklerinden alınacak kalıplar + hazal/pure projelerinden re-use'lar
**Hedef:** "Hangi modülü, nereden alacağız, nasıl yapacağız" — tek dokümanda

---

## 0. Yeniden kullanılabilir kaynaklar (Desktop'tan)

### 0.1 hazal/api — re-use edilecek modüller

| Modül | Dosyalar | Kullanılabilir mi? | Not |
|---|---|---|---|
| **mail/** | `mail.controller.ts`, `mailbox.service.ts`, `imap-fetcher.service.ts` | ✅ Direkt kopyala | IMAP (gelen) + SMTP/Resend (giden) hibrit — tek inbox |
| **notifications/email.service.ts** | EmailService | ✅ Direkt kopyala | Resend + SMTP fallback, dependency injection clean |
| **notifications/notifications.gateway.ts** | WebSocket | ✅ Adapte et | Real-time bildirim için (AI üretim progress, admin notifs) |
| **calendar-events/** | Service + controller | ✅ Adapte et | Editöryel takvim + etkinlik takvimi için baz |
| **mail-templates/** | Template CRUD | ✅ Adapte et | Newsletter + welcome sequence template'leri için |
| **push/** | Push notification | ⚠ Faz 2 | MarkaRadar mobile yok, şimdilik atla |
| **morning-summary/** | Daily AI digest | ✅ İlham al | "Pazarlama 5" günlük newsletter pattern'ı için |
| **ai/** | AI providers wrapper | ✅ Adapte et | OpenAI/Anthropic abstraction |
| **newsletter/** | Subscriber + issue | ✅ Adapte et | Beehiiv yerine kendi sistemle başla |
| **uploads/** | Multer + storage | ✅ Kopyala | MinIO/R2 entegrasyonu için |

**Hazal'ın deps yararlı olanlar:**
- `imapflow@^1.0.180` — IMAP client
- `mailparser@^3.7.2` — RFC 822 parse
- `nodemailer@^8.0.7` — SMTP send
- `resend@^4` — Resend HTTP API

### 0.2 pure/backend — re-use edilecek modüller

| Modül | Dosyalar | Kullanılabilir mi? | Not |
|---|---|---|---|
| **calendar/** | Basit takvim | ✅ İlham — `attendees: String[]` kalıbı | Hazal'dan daha basit ama listing-bağımsız |
| **identity/** | Auth + RBAC | ✅ İncele | Refresh token rotation buradan |
| **subscription/** | Üyelik state machine | ✅ Direkt kullan | Stripe/iyzico için baz |
| **invoice/** | Fatura | ✅ Adapte | Premium üye faturaları için |
| **ai-service/** | AI orchestrator | ✅ İncele | Daha modüler olabilir |
| **notification/** | Mail + push | ✅ İncele | Hazal'la karşılaştır, daha temiz olanı al |
| **payment/** | Stripe/iyzico | ✅ Direkt kullan | Hibrit gateway |
| **review/** | Review sistemi | ✅ Adapte | AjansRadar verified reviews için baz |
| **cms/** | İçerik yönetimi | ⚠ İncele | Articles modülümüzle çakışabilir |
| **gdpr/** | Veri silme + export | ✅ Direkt kullan | KVKK için aynısı işler |
| **loyalty/** | Sadakat puanları | ⚠ Faz 2 | Şimdilik gerek yok |
| **chatbot/** | Bot integration | ⚠ Faz 2 | İleride CMO Club Slack için |

**Karar:** İki projeden de en iyi kalıbı al. **Mail için hazal**, **Subscription için pure**, **Calendar için ikisinin hibridi**.

---

## 1. Backend full özellik haritası — 28 modül

> Strateji dokümanındaki tüm özellikler + altyapı + hibrit eklemeler. Her modül: amaç + bağımlılık + dünya örneği + hibrit yaklaşım.

### 1.1 Auth (kimlik doğrulama)
- **Amaç:** Register, login, refresh, logout, password reset, email verification, 2FA (faz 2)
- **Bağımlılık:** Mail, Users
- **Dünya örneği:** Clerk, Auth0, Supabase Auth, NextAuth
- **Hibrit:** JWT (httpOnly cookie) + refresh token rotation + session table (kim hangi cihazdan giriyor görünür) — Clerk'ın "Active Sessions" UX'i
- **Re-use:** pure/identity'den RBAC + 2FA pattern'ı al

### 1.2 Users (kullanıcı profili)
- **Amaç:** Profil, avatar, bio, rol, ayarlar
- **Bağımlılık:** Auth, Storage (avatar)
- **Dünya örneği:** GitHub, Linear — profile page minimal ama derin
- **Hibrit:** User → settings (preferences) ayrı tablo (notification prefs, language, theme)
- **Re-use:** —

### 1.3 RBAC (rol & izin)
- **Amaç:** super_admin, editor, writer, social_manager, sales, agency_user, brand_user, reader
- **Bağımlılık:** Auth
- **Dünya örneği:** Notion (role + workspace), Linear (admin/member/guest)
- **Hibrit:** Role + Resource-based permissions (e.g. editor can edit own articles, super_admin everything)
- **Re-use:** pure/identity'den RBAC altyapısı

### 1.4 Content / Articles (makaleler)
- **Amaç:** Article CRUD, draft/scheduled/published, AI alanları, premium flag, soft delete
- **Bağımlılık:** Users, Categories, Tags, Storage, AI, Cache
- **Dünya örneği:** Sanity, Strapi, Ghost — versioning + scheduled publish + revision history
- **Hibrit:** TipTap content + AI generated alanlar + revision history (faz 2) + scheduled publishing (BullMQ delayed job)
- **Re-use:** hazal/blog'tan publishing flow

### 1.5 Categories & Tags
- **Amaç:** Hierarchical kategori, etiketler (topic/brand/agency/person/campaign/tool)
- **Bağımlılık:** Articles
- **Dünya örneği:** WordPress, Ghost
- **Hibrit:** Mevcut yapı yeterli, sadece reorder API ekle (sürükle-bırak admin'de)

### 1.6 Media / Storage
- **Amaç:** Image upload, resize (Sharp), AI generated image, presigned URL, video (faz 2)
- **Bağımlılık:** Storage backend (MinIO yerel, R2 prod)
- **Dünya örneği:** Cloudinary (image API), UploadThing, Mux (video)
- **Hibrit:** Self-host MinIO/R2 + Sharp resize on-upload + signed URL'ler (private content için) + CDN front (Cloudflare)
- **Re-use:** hazal/uploads + pure'dan storage abstraction

### 1.7 AI Pipeline ⭐ (ürünün diferansiyon noktası)
- **Amaç:** Kaynak → 8 format AI üretim (başlık, spot, body, summary, why-matters, brand-takeaways, agency-takeaways, LinkedIn, IG carousel, Reels, SEO meta, görsel prompt)
- **Bağımlılık:** OpenAI/Anthropic/Gemini, BullMQ, Cache, AiGeneration log
- **Dünya örneği:**
  - **Jasper** — content generation tools
  - **Copy.ai** — workflow-based
  - **Anthropic Workbench** — playground UX
  - **OpenPipe** — prompt registry + evals
- **Hibrit:**
  - Multi-provider abstraction (OpenAI ana, Anthropic fallback, cost-based routing)
  - Prompt versioning (`prompts/title/v1.ts`, `v2.ts` — A/B testable)
  - Streaming response (WebSocket — kullanıcı uzun beklemesin)
  - Cost tracking → günlük/aylık budget guard
  - Cache: aynı source URL → 7 gün cache (token tasarrufu)
- **Re-use:** hazal/ai + hazal/morning-summary (günlük digest pattern)

### 1.8 Newsletter
- **Amaç:** Subscriber yönetimi, issue compose, send, double opt-in, segments, A/B subject, open/click tracking
- **Bağımlılık:** Mail, Articles, AI, BullMQ
- **Dünya örneği:**
  - **Beehiiv** — operatör tarzı, monetization en güçlü (third-party)
  - **ConvertKit/Kit** — creator-friendly
  - **Mailchimp** — geleneksel, drag-drop builder
  - **Buttondown** — minimal, developer-friendly
  - **Substack** — abone + monetize entegre (ama vendor lock-in)
- **Hibrit (2 seçenek):**
  - **A) Kendi yapım:** Tam kontrol, vendor cost yok, ama deliverability hassas (DKIM/SPF/DMARC + IP warmup)
  - **B) Beehiiv API:** Hızlı, monetization, ama vendor bağımlılığı
  - **Öneri:** **B** ile başla (faz 1), faz 2'de **A**'ya geç. Strateji dokümanında Beehiiv önerildi.
- **Re-use:** hazal/newsletter + mail-templates

### 1.9 Mail ⭐ (HAZAL'DAN ALINACAK)
- **Amaç:** Gelen mail (IMAP) + giden mail (SMTP/Resend) tek panel, soft delete, search, read state
- **Bağımlılık:** —
- **Dünya örneği:**
  - **Hey.com (Basecamp)** — kategori-based inbox, "Imbox/Feed/Paper Trail"
  - **Front** — team inbox + asignment + canlı yorumla
  - **Missive** — multi-channel (mail + SMS + WhatsApp)
  - **Superhuman** — speed + AI assist
- **Hibrit (hazal'ın pattern'ı + ekleme):**
  - IMAP fetch (manuel veya cron) + SMTP/Resend send
  - Tek `EmailMessage` tablosu (INBOUND/OUTBOUND)
  - `threadKey` ile thread grouping (subject normalize)
  - Admin'de Hey-style inbox UI
  - **Eklenecek:** AI ile auto-categorize ("müşteri sorgusu" / "spam" / "reklam talebi") — strateji'de "leads" pipeline'a otomatik düşsün
  - **Eklenecek:** Email-to-lead (gelen mail → CRM contact + lead kaydı)
- **Re-use:** **hazal/mail tam paket** — `mailbox.service.ts`, `imap-fetcher.service.ts`, `mail.controller.ts`, `EmailMessage` schema

### 1.10 Calendar / Events ⭐ (PURE + HAZAL HİBRİDİ)
- **Amaç:** Editöryel takvim (yayın planı), etkinlik takvimi (zirve, ödül, webinar), randevu (CMO meetings), hatırlatma
- **Bağımlılık:** Users, Articles (yayın planı), Events (etkinlikler)
- **Dünya örneği:**
  - **Cal.com** — open source scheduling, recurring + group + workflow
  - **Calendly** — slot booking
  - **Notion Calendar (Cron)** — birden çok takvim source
  - **Fantastical** — natural language event input
- **Hibrit:**
  - Hazal'ın CalendarEvent yapısı (geniş — listing/inquiry bağlantı yerine bizim için article/event/agency)
  - Pure'un `attendees: String[]` kalıbı
  - 4 event tipi: `EDITORIAL` (article yayın), `MEETING` (CMO görüşmesi), `EVENT` (etkinlik), `REMINDER` (genel)
  - `ICalendar` (.ics) feed export — kullanıcı Google Calendar'a abone olur
  - **Eklenecek:** Cal.com-style booking page (CMO randevu alma)
  - **Eklenecek:** Yayın takvimi otomatik dolar (article scheduled_at → CalendarEvent)
- **Re-use:** **hazal/calendar-events schema** + pure/calendar attendees pattern'ı

### 1.11 Notifications
- **Amaç:** In-app bildirim, WebSocket gerçek-zamanlı push, mail bildirim, (push faz 2)
- **Bağımlılık:** Mail, WebSocket
- **Dünya örneği:**
  - **Knock.app** — multi-channel notification orchestrator
  - **Novu** — open source alternative
  - **GitHub** notification system — channel preferences per type
- **Hibrit:**
  - `Notification` tablosu (user_id, type, payload, read_at)
  - WebSocket gateway (admin için real-time)
  - User preferences: hangi event hangi kanalda (mail/in-app/push)
- **Re-use:** hazal/notifications gateway + service

### 1.12 Agencies + Verified Reviews ⭐
- **Amaç:** Ajans CRUD, tier yönetimi (free/basic/premium/featured/elite), müşteri review submission, email + LinkedIn verification, moderation queue, right to reply, anti-fraud
- **Bağımlılık:** Auth, Mail, AI (similarity check), Cache
- **Dünya örneği:**
  - **Clutch.co** — anchor reference (verified reviews altın standardı)
  - **G2** — software reviews (otomatik LinkedIn verify)
  - **TrustPilot** — geniş kategori
  - **DesignRush** — daha küratör
  - **The Manifest** — Clutch'un SEO-odaklı yan markası
- **Hibrit:**
  - Clutch'un verification flow'u (email domain match + LinkedIn URL + 5 yıldız puanlama)
  - G2'nin auto-verify ile LinkedIn OAuth (reviewer LinkedIn'le giriş yapar → otomatik doğrula)
  - "Yıllık Top 50" ranking algoritması (review skoru + recency + verification + ajans büyüklüğü)
- **Re-use:** pure/review modülünü baz al

### 1.13 Jobs (iş ilanları)
- **Amaç:** Job posting CRUD, paid tiers (basic/featured/premium distribution), employer brand microsite, applications (faz 2)
- **Bağımlılık:** Auth, Storage (logo), Mail (apply notification)
- **Dünya örneği:**
  - **Built In** — tech şirketleri + employer brand microsite
  - **LinkedIn Jobs** — feed + apply
  - **AngelList Talent** (Wellfound) — startup-focused
  - **WeWorkRemotely** — minimal, single niche
- **Hibrit:**
  - Built In'in **microsite paketi** ana ürün (yıllık 49K-149K TL)
  - LinkedIn Jobs API ile cross-post (single post → 5 kanal)
  - Apply tracking (apply_url tıklama + faz 2'de apply form içeride)
- **Re-use:** —

### 1.14 Subscriptions (premium üyelik) ⭐
- **Amaç:** MarkaRadar+ Lite ($99/yıl) / Pro ($499/yıl) / Enterprise ($2999/yıl) — Stripe (intl) + iyzico (TR), recurring billing, dunning, cancellation flow, winback, Founding Member
- **Bağımlılık:** Mail (welcome sequence), BullMQ (renewal jobs), Webhooks
- **Dünya örneği:**
  - **Stripe Billing** — direct (gold standard)
  - **Lemon Squeezy** — VAT handling otomatik, MoR (Merchant of Record)
  - **Paddle** — MoR alternatif
  - **Chargebee** — enterprise tier
  - **Substack** — newsletter + paywall entegre
  - **Memberful** — small creator subscriptions
- **Hibrit:**
  - **Stripe (USD)** uluslararası için (Founding Member, MENA)
  - **iyzico (TRY)** Türkiye için (KDV otomatik, türev faturalandırma)
  - State machine: trialing → active → past_due → canceled → reactivated
  - Cancellation save flow (anket → dynamic teklif — Stratechery/Lenny modeli)
  - Dunning: 3 retry + email + SMS (Twilio faz 2)
- **Re-use:** **pure/subscription** + payment + invoice modüllerini al

### 1.15 Payment Gateway
- **Amaç:** Stripe + iyzico abstraction, webhook signature verify, refund, idempotency
- **Bağımlılık:** Subscriptions, Audit log
- **Dünya örneği:**
  - **Stripe Connect** — multi-vendor (faz 3'te marketplace gerekirse)
  - **PayPal** — eski standard
- **Hibrit:**
  - `PaymentProvider` interface: `createCheckout()`, `cancelSubscription()`, `refund()`
  - Stripe + iyzico ayrı implementation
  - Webhook idempotency: `webhook_events` tablosu, event_id unique
- **Re-use:** **pure/payment** modülü

### 1.16 Reports / Premium content
- **Amaç:** Rapor mağazası (Türkiye Pazarlama Endeksi, Q3 trend raporu, vb), one-time purchase + subscription bundle, signed download URL
- **Bağımlılık:** Storage, Auth, Subscriptions
- **Dünya örneği:**
  - **eMarketer/Insider Intelligence** — $25K+/yıl kurumsal abone, raporları paywall arkasında
  - **WARC** — vaka analizi kütüphanesi
  - **Contagious** — premium PDF + sub aboneliği
  - **Gartner/Forrester** — enterprise research
- **Hibrit:**
  - Rapor satışı + premium abone bedava — Stratechery modeli
  - PDF watermark (kim indirdi → her kopyada user_id görünür)
  - Türkiye Pazarlama Endeksi: aylık panel research (research_panel modülü)
- **Re-use:** —

### 1.17 Research Panel ⭐
- **Amaç:** "Türkiye Pazarlama Endeksi" için panel üyeleri (300 CMO), aylık anketler, otomatik rapor üretimi
- **Bağımlılık:** Users, Mail, AI (özet)
- **Dünya örneği:**
  - **eMarketer Pulse** — paneli + dashboard
  - **YouGov** — panel + survey + brand tracker
  - **Stack Overflow Developer Survey** — yıllık paneli
- **Hibrit:**
  - Anket inviter (mail + admin panel)
  - Yanıt incentive (premium üyelik kredisi)
  - AI ile rapor draft (research_surveys → AI → markdown rapor)
- **Re-use:** —

### 1.18 Courses (Akademi)
- **Amaç:** Mini MBA kohortları, self-paced kurslar, enrollment, payment, certificate, alumni Slack
- **Bağımlılık:** Subscriptions, Storage (video — faz 2), Mail (kohort iletişim), Community
- **Dünya örneği:**
  - **Maven** — cohort-based, en yakın model
  - **Teachable** — self-paced kurslar
  - **Thinkific** — kurumsal eğitim
  - **Marketing Week Mini MBA** — strateji'deki anchor referans
  - **Reforge** — high-end B2B kohort
- **Hibrit:**
  - Maven-style cohort + Zoom entegrasyonu
  - Self-paced için kendi platform veya Teachable
  - Certificate generator (PDF + LinkedIn badge — Credly API faz 2)
  - Alumni Slack auto-invite
- **Re-use:** —

### 1.19 Events + Awards
- **Amaç:** Yıllık zirve, "Türkiye AI Marketing Ödülleri" başvuru + jüri + tören, bilet satışı
- **Bağımlılık:** Subscriptions (bilet), Storage (vaka analizi yüklemek), Mail (jüri iletişim)
- **Dünya örneği:**
  - **The Drum Awards** — başvuru + jüri + ödül tören sistemi
  - **Cannes Lions** — uluslararası standart
  - **Effie Awards** — vaka analizi format
  - **Webby Awards** — online başvuru + halk oylaması
- **Hibrit:**
  - Award submission + jury scoring + winner announcement
  - Event ticket sales (Cvent/Bizzabo benzeri ama daha basit)
  - QR code attendee check-in
- **Re-use:** hazal/calendar-events baz olarak

### 1.20 Community (Slack/Discord)
- **Amaç:** CMO Club premium üyelere, sosyal medya profesyonelleri Discord (faz 2-3)
- **Bağımlılık:** Subscriptions (Pro tier zorunlu), Slack API
- **Dünya örneği:**
  - **Lenny's Newsletter Slack** — paid membership + content community
  - **Pavilion** — sales/CRO premium community ($4K/yıl)
  - **Future Commerce** — DTC community
  - **Circle.so** — self-hosted community SaaS
- **Hibrit:**
  - Premium üye Pro+ olunca Slack workspace'e otomatik invite (Slack SCIM API)
  - Membership iptal → Slack'ten otomatik çıkar
  - Topluluk metrics (haftalık aktif, en aktif üyeler)
- **Re-use:** —

### 1.21 Social (LinkedIn/Buffer entegrasyonu)
- **Amaç:** Article → LinkedIn/IG/X otomatik post (admin tek tıkla), zamanlama, performans takibi
- **Bağımlılık:** AI (post generate), BullMQ
- **Dünya örneği:**
  - **Buffer** — multi-channel scheduling
  - **Hootsuite** — enterprise
  - **Later** — visual content calendar
  - **SocialBee** — recycling content
  - **Typefully** — Twitter/X first
- **Hibrit:**
  - Buffer API ile cross-post (LinkedIn + IG + X + Threads)
  - LinkedIn API direkt (faz 2 — auth flow + post)
  - Performance webhook (impressions, clicks → analytics)
- **Re-use:** —

### 1.22 Ads (banner reklam + sponsorlu)
- **Amaç:** Reklamveren listesi, kampanya yönetimi, ad slot (homepage, sidebar, article inline), impression/click tracking
- **Bağımlılık:** Auth, Storage (creative), Analytics
- **Dünya örneği:**
  - **Google AdManager** — enterprise ad server
  - **Carbon Ads** — niche developer-focused
  - **Snigel/Mediavine** — publisher ad management
  - **Kevel** — APIfirst ad server (most customizable)
- **Hibrit:**
  - Kendi minimal ad server (GAM aşırı kompleks bizim için)
  - Direct sold (sales kapatır → admin'de campaign create) — faz 1
  - Self-serve ad portal (faz 2) — reklamveren kendi yükler
- **Re-use:** —

### 1.23 Analytics
- **Amaç:** Pageview, scroll depth, CTA click, conversion funnel, custom event tracking, internal dashboard
- **Bağımlılık:** —
- **Dünya örneği:**
  - **PostHog** — open source product analytics + feature flags
  - **Plausible** — privacy-friendly, GDPR
  - **Fathom** — minimal
  - **Mixpanel** — funnel + retention
  - **Amplitude** — enterprise
- **Hibrit:**
  - PostHog (self-host veya cloud — EU region) — frontend + backend events
  - Plausible — public-facing GA replacement
  - Backend `analytics_events` tablosu — kendi metrics dashboard için
- **Re-use:** —

### 1.24 Audit Log
- **Amaç:** Kim ne yaptı (article published, role changed, agency tier upgraded, user banned), KVKK için zorunlu
- **Bağımlılık:** Auth
- **Dünya örneği:**
  - **AuditBoard** — enterprise audit
  - **GitHub Audit Log** — granular event log
  - **Stripe Events** — every action logged
- **Hibrit:**
  - `AuditLog` tablosu (actor_id, action, resource, before/after diff)
  - `@Auditable` decorator + AuditInterceptor
  - Admin'de search + filter UI
- **Re-use:** —

### 1.25 GDPR / KVKK
- **Amaç:** Veri export (kullanıcı kendi datasını ZIP indirir), veri silme talep + onay, çerez consent log, açık rıza kayıt
- **Bağımlılık:** Auth, Mail
- **Dünya örneği:**
  - **OneTrust** — enterprise consent management
  - **Cookiebot** — banner + scan
  - **Iubenda** — küçük ölçek
- **Hibrit:**
  - Kendi consent banner (Cookiebot SaaS yerine — TR pazarı için yeter)
  - `/api/v1/me/export` — user'ın tüm datası ZIP
  - `/api/v1/me/delete` — anonymize + cascading delete (legal'da 30 gün bekle)
- **Re-use:** **pure/gdpr modülü** direkt al

### 1.26 Webhooks
- **Amaç:** Stripe, iyzico, Beehiiv, Resend (delivery events) webhook'ları
- **Bağımlılık:** Audit log
- **Dünya örneği:** Stripe's webhook design canonik
- **Hibrit:**
  - `/api/v1/webhooks/:provider` endpoint pattern
  - Raw body middleware (signature verify için)
  - Idempotency: `webhook_events` tablosu, event_id unique
  - Async processing: webhook hemen 200, gerçek iş queue'ya
- **Re-use:** —

### 1.27 Cron / Scheduled jobs
- **Amaç:** Subscription renewal check (günlük), newsletter digest gönderim (günlük 08:30), report generation (aylık), cache warm-up
- **Bağımlılık:** BullMQ
- **Dünya örneği:**
  - **node-cron** — basit
  - **Temporal** — durable workflows (enterprise)
  - **Inngest** — modern cron + queue + event-driven
- **Hibrit:**
  - BullMQ Repeatable Jobs ile cron pattern
  - Faz 2'de Inngest düşün (durable workflows + retry UI ile)
- **Re-use:** —

### 1.28 Search
- **Amaç:** Site içi arama (articles, agencies, jobs, courses)
- **Bağımlılık:** —
- **Dünya örneği:**
  - **Meilisearch** — fast, typo-tolerant
  - **Typesense** — alternatif
  - **Algolia** — premium SaaS
  - **Elasticsearch** — enterprise
  - **PostgreSQL FTS** — built-in (yeterli başlangıçta)
- **Hibrit:**
  - Postgres FTS (`tsvector`) → 100K içerik altı yeter
  - Meilisearch (faz 2) → 100K+ olunca geç
  - Search analytics: en çok aranan kelimeler, sonuçsuz aramalar

---

## 2. Dünya örneklerinin kombinasyonu — "MarkaRadar nasıl bir hibrit"

| Strateji parçası | Kalıbı nereden | Bizdeki uygulama |
|---|---|---|
| Newsletter-first medya | Marketing Brew (Morning Brew) | Beehiiv API + günlük "Pazarlama 5" |
| Founder-led ses | Stratechery, Lenny's Newsletter | Kurucu LinkedIn ana dağıtım |
| Premium subscription | Digiday+, The Information, Stratechery | Stripe + iyzico, $99/$499/$2999 tarifeler |
| Verified directory | Clutch.co, G2 | LinkedIn OAuth + email domain match |
| Employer brand microsite | Built In | Job posting + yıllık paket |
| Mini MBA (eğitim) | Marketing Week Mini MBA, Maven | Cohort-based + sertifika |
| Premium community | Lenny's Slack, Pavilion | Pro tier → Slack auto-invite |
| Awards programı | The Drum, Adweek, Cannes | Yıllık başvuru + jüri + tören |
| Proprietary data | eMarketer Pulse, YouGov, Stack Overflow Survey | Aylık 300 CMO paneli |
| Multi-format content | Axios "Smart Brevity" | AI ile 8 format atomization |
| Mail inbox (gelen) | Hey.com, Front | IMAP + threading (hazal'dan) |
| Transactional mail | Resend, Postmark, SendGrid | Resend ana + SMTP fallback (hazal'dan) |
| Calendar | Cal.com + Fantastical | Booking + .ics export |
| Subscription billing | Stripe Billing, Chargebee | Stripe + iyzico hibrit |
| Analytics | PostHog + Plausible | İkisi paralel (privacy + product) |
| Search | Meilisearch, Algolia | Postgres FTS → Meilisearch (faz 2) |
| Storage | Cloudinary, R2 | MinIO yerel, R2 prod (Sharp resize) |
| Cron/Jobs | Inngest, Temporal | BullMQ → Inngest (faz 3) |
| RBAC | Auth0, pure/identity | Role + resource permissions |
| Audit log | Stripe Events, GitHub Audit | Decorator + interceptor |
| GDPR | OneTrust, pure/gdpr | Self-host (TR pazarı yeter) |
| Push notification | Knock.app, Novu | Faz 2 (mobile gelince) |
| Mail templating | React Email, MJML | React Email (developer-friendly) |
| Webhook handling | Stripe webhook design | Idempotent + queue async |

---

## 3. Re-use stratejisi — adım adım

### Adım 1: hazal'dan kopyalanacaklar (1 saat)
```bash
# Mail modülü
cp -r /Users/emre/Desktop/hazal/api/src/mail /Users/emre/Desktop/brand/api/src/modules/
cp -r /Users/emre/Desktop/hazal/api/src/mail-templates /Users/emre/Desktop/brand/api/src/modules/
cp /Users/emre/Desktop/hazal/api/src/notifications/email.service.ts /Users/emre/Desktop/brand/api/src/shared/mail/

# Calendar
cp -r /Users/emre/Desktop/hazal/api/src/calendar-events /Users/emre/Desktop/brand/api/src/modules/calendar

# Notifications (WebSocket gateway)
cp -r /Users/emre/Desktop/hazal/api/src/notifications /Users/emre/Desktop/brand/api/src/modules/

# AI orchestrator (inceleyip adapte et)
cp -r /Users/emre/Desktop/hazal/api/src/ai /Users/emre/Desktop/brand/api/src/modules/ai

# Newsletter altyapısı
cp -r /Users/emre/Desktop/hazal/api/src/newsletter /Users/emre/Desktop/brand/api/src/modules/

# Schema parçalarını birleştir (manuel — EmailMessage, CalendarEvent, vb)
```

### Adım 2: pure'dan kopyalanacaklar (1 saat)
```bash
# Subscription + payment + invoice (Stripe/iyzico için kritik)
cp -r /Users/emre/Desktop/bütün-projeler/freelancer/pure/backend/src/modules/subscription /Users/emre/Desktop/brand/api/src/modules/
cp -r /Users/emre/Desktop/bütün-projeler/freelancer/pure/backend/src/modules/payment /Users/emre/Desktop/brand/api/src/modules/
cp -r /Users/emre/Desktop/bütün-projeler/freelancer/pure/backend/src/modules/invoice /Users/emre/Desktop/brand/api/src/modules/

# GDPR
cp -r /Users/emre/Desktop/bütün-projeler/freelancer/pure/backend/src/modules/gdpr /Users/emre/Desktop/brand/api/src/modules/

# Identity (RBAC + 2FA pattern — sadece inceleyip baz al, kopyalama)
# cp -r .../identity/* → AUTH güçlendirme için

# Review (verified review baz)
cp -r /Users/emre/Desktop/bütün-projeler/freelancer/pure/backend/src/modules/review /Users/emre/Desktop/brand/api/src/modules/
```

### Adım 3: Schema birleştirme (yarım gün)
- `EmailMessage`, `CalendarEvent`, `Subscription`, `Payment`, `Invoice`, `Review` tabloları **hazal/pure** schema'larından bizim `schema.prisma`'ya aktarılır
- İlişki düzeltmeleri: hazal'da `Listing` foreign key var → biz `Article` veya `Agency`'ye çeviririz
- Migration: `prisma migrate dev --name reuse_modules`

### Adım 4: Module wiring (1-2 gün)
- `app.module.ts`'e yeni modüller eklenir
- Cross-dependency'ler (MailModule → AuthModule, vs)
- `.env.example` IMAP/SMTP/Stripe/iyzico/Beehiiv key'leri eklenir

### Adım 5: Test + smoke (yarım gün)
- Her modülün temel endpoint'i Swagger'dan test
- E2E: mail send + receive flow, calendar event create, subscription checkout

**Toplam tahmini süre:** 3-4 gün full re-use + adapte.

---

## 4. Geliştirme sırası — yeniden öneri

Mevcut sprint planı + re-use stratejisi:

### Sprint 1.5 (1 hafta) — Foundation pekiştirme
*(Backend_Analiz.md'deki gibi)*
- Global ExceptionFilter, RolesGuard, PaginationDto, ShutdownHooks, Sentry, audit log iskeleti

### Sprint 2 — Mail + Calendar re-use (1 hafta)
- hazal/mail tam kopya → MarkaRadar'a adapte
- hazal/calendar-events → editöryel takvim olarak yeniden konumla
- EmailService (Resend + SMTP) shared/mail'e koy
- WebSocket gateway notifications

### Sprint 3 — Auth tamamlama + Storage (1 hafta)
- Refresh token rotation (pure/identity'den)
- Email verification (mail kullan)
- Password reset
- MinIO + Sharp upload pipeline
- Slug generator

### Sprint 4 — AI Pipeline (1.5 hafta)
- BullMQ kurulum + ayrı worker
- hazal/ai'yi baz al, prompt library MarkaRadar_v2_Hibrit_Strateji.md'den
- 8 format generator
- Cost tracker + ai_generations log
- Streaming response (WebSocket)

### Sprint 5 — Articles admin CRUD + Cache (1 hafta)
- Article CRUD (TipTap content, AI alanları)
- Category/Tag admin
- Redis cache layer (list + detail)
- Scheduled publish (BullMQ delayed job)

### Sprint 6 — Newsletter + Beehiiv (1 hafta)
- hazal/newsletter baz
- Beehiiv API entegrasyonu
- Subscriber import (CSV)
- Daily digest cron (08:30)
- Double opt-in
- Open/click webhook

### Sprint 7 — Agencies + Verified Reviews (1.5 hafta)
- pure/review baz, Clutch flow ekle
- LinkedIn OAuth (verification için)
- Moderation queue (admin)
- Right to reply
- Anti-fraud (AI similarity check)
- Yıllık Top 50 ranking algoritması

### Sprint 8 — Subscriptions + Payment (1.5 hafta)
- pure/subscription + payment + invoice direkt
- Stripe ($) + iyzico (TRY) hibrit
- Webhook handlers
- Welcome sequence (7-day email)
- Cancellation save flow
- Dunning

### Sprint 9 — Jobs + Reports + Audit (1 hafta)
- Job posting + employer brand microsite
- Premium rapor mağazası (signed download)
- Audit log interceptor canlı
- KVKK export/delete endpoints

### Sprint 10 — Events + Awards + Community (1.5 hafta)
- Awards submission + jury scoring
- Event ticket sales
- Slack integration (CMO Club auto-invite)

### Sprint 11 — Social + Ads + Search (1 hafta)
- Buffer API + LinkedIn cross-post
- Banner ad server (basic)
- Meilisearch index

### Sprint 12 — Research Panel + Analytics + Production hardening (1.5 hafta)
- Türkiye Pazarlama Endeksi modülü
- PostHog backend events
- Production deploy script + monitoring
- Load test + cache warm-up

**Toplam: ~13 hafta = 3 ay yoğun backend.**

---

## 5. Tek bakışta — Final 28 modül durumu

```
KATEGORI A — FOUNDATION (Sprint 1.5)
  [ ] common/exception-filter
  [ ] common/roles-guard + roles decorator
  [ ] common/audit interceptor
  [ ] common/pagination DTO
  [ ] shared/sentry

KATEGORI B — KULLANICI + AUTH (Sprint 2-3)
  [✓] auth (kısmi — refresh broken)
  [ ] auth + refresh rotation
  [ ] auth + email verification
  [ ] auth + password reset
  [ ] 2FA (faz 2)
  [✓] users (kısmi)
  [ ] rbac (roles enforcement)

KATEGORI C — İÇERİK + AI (Sprint 4-5)
  [✓] content/articles (public list + detail)
  [ ] content/articles admin CRUD
  [ ] categories admin
  [ ] tags admin
  [ ] media/storage (MinIO + Sharp)
  [ ] ai pipeline (8 format)
  [ ] ai_generations log + cost tracker

KATEGORI D — İLETİŞİM (Sprint 2 + 6)
  [ ] mail (hazal) — gelen + giden
  [ ] mail-templates (hazal)
  [ ] newsletter (hazal + Beehiiv)
  [ ] notifications (hazal WebSocket)
  [ ] calendar (hazal + pure hibrit)

KATEGORI E — TİCARET (Sprint 7-8)
  [ ] subscriptions (pure)
  [ ] payment Stripe (pure)
  [ ] payment iyzico (pure adapt)
  [ ] invoice (pure)
  [ ] webhooks

KATEGORI F — KATALOG (Sprint 7, 9, 10)
  [ ] agencies (yeni)
  [ ] agency_reviews (pure review + Clutch flow)
  [ ] jobs
  [ ] employer_brands
  [ ] courses (akademi)
  [ ] events + awards
  [ ] reports

KATEGORI G — ENTEGRASYONLAR (Sprint 11)
  [ ] social (LinkedIn + Buffer)
  [ ] ads (basic ad server)
  [ ] search (Postgres FTS → Meilisearch)
  [ ] community (Slack)

KATEGORI H — OPERASYON (Sprint 12)
  [ ] research_panel (Türkiye Pazarlama Endeksi)
  [ ] analytics_events
  [ ] audit_logs (decorator + UI)
  [ ] gdpr/kvkk endpoints (pure)
  [✓] health (var)
  [✓] prisma (var)
  [✓] redis (var)
  [ ] bullmq + worker
```

---

## 6. Sonraki adım — Karar bekliyor

Şu seçenekler var:

### A) Full re-use ile başla (önerim)
1. **Bugün:** hazal/mail + calendar-events + email.service'i kopyala, schema'yı birleştir, migrate et
2. **Yarın:** pure/subscription + payment + gdpr kopyala
3. **Sonraki gün:** Foundation (Sprint 1.5 — filter, roles, audit) yaz
4. Sonra strateji'deki feature'lara geç

### B) Strict sprint planı
- Sprint 1.5 → Sprint 2 → ... şeklinde ilerle
- Re-use varsa tabii ki kullan ama sıra atlamadan

### C) Specific modül
- "Sadece mail" veya "sadece subscriptions" gibi tek modül üzerine yoğunlaş

**Öneri:** **A** — re-use'lar önümüzdeki 3-4 günü 2-3 hafta kazandırır. Sonra strict sprint planına geç.

Hangisini seçtiğinde söyle, kodlamaya başlayayım.
