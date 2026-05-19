# MarkaRadar — Çalışma Mantığı ve Özellikler

**Versiyon:** v1.0 — 14 Mayıs 2026
**Stack:** Next.js 15 (web + admin) + NestJS 10 (api) + Postgres + Redis + BullMQ
**Format:** "Ne yapıyor, nasıl çalışıyor, hangi özellikleri var" — tek doküman

---

## 1) MarkaRadar nedir? Tek cümlede

**MarkaRadar, Türkiye'nin pazarlama profesyonelleri için günlük newsletter + AI-native editöryel medya + doğrulanmış ajans rehberi + premium subscription + eğitim akademisi + ödül programı'nı tek çatı altında birleştiren platformdur.**

Dünya örnekleri kombinasyonu:
- **Marketing Brew** (newsletter-first medya)
- **Stratechery** (kurucu-yönetimli premium analiz)
- **Clutch.co** (verified agency reviews)
- **Marketing Week Mini MBA** (eğitim margin'i)
- **The Drum Awards** (yıllık ödül programı)
- **Lenny's Newsletter** (premium topluluk)

---

## 2) Hedef kitle — kim için?

5 ana persona (strateji v2 dokümanından):

| Persona | Rol | Ne kazanır |
|---|---|---|
| **Selin (CMO)** | 38 yaş, FMCG, 80-150M TL bütçe | Globalden Türkiye'ye trend uyarlama, AI'nın pazarlamaya etkisi raporu, yıllık endeks |
| **Burak (Ajans sahibi)** | 34 yaş, 15-50 kişilik dijital ajans | Premium listing, iş ilanı, sektörde adının geçmesi |
| **Ceren (Sosyal medya uzmanı)** | 27 yaş, ajans çalışanı | Günlük trend brief, Reels/carousel formatlı içerik, kariyer ilerleyişi |
| **Murat (MarTech kurucusu)** | 32 yaş, SaaS/AI tool | Ürün lansman duyurusu, lead toplama, yatırımcı görünürlüğü |
| **Ayşe (İK / İşveren markası)** | 36 yaş, banka/holding | İş ilanı paketleri, employer brand microsite |

Bonus: **Cem (Solo danışman)** — eski CMO, premium subscription'a en yatkın segment.

---

## 3) Sistem mimarisi — 3 uygulama, 1 backend

```
┌───────────────────────────────────────────────────────────┐
│                    Kullanıcılar                            │
│   CMO/Editor/Reader/Agency/Brand/Sales                     │
└───┬─────────────────┬──────────────────────┬──────────────┘
    │ markaradar.com   │ admin.markaradar.com │ api.markaradar.com
    │                  │                      │
┌───▼─────────┐  ┌─────▼─────────┐  ┌─────────▼─────────┐
│ web         │  │ admin         │  │ api (NestJS)      │
│ Next.js 15  │  │ Next.js 15    │  │ + worker (BullMQ) │
│ port 3003   │  │ port 3004     │  │ port 4000         │
└─────────────┘  └───────────────┘  └────┬──────┬───┬───┘
                                          │      │   │
                                    ┌─────▼┐  ┌─▼─┐ │
                                    │ PG   │  │Red│ │
                                    │ 16   │  │ 7 │ │
                                    └──────┘  └───┘ │
                                                    ▼
                            R2 + Stripe + iyzico + OpenAI + Resend + Beehiiv
```

**3 uygulama:**
1. **web** (3003) — public site, SEO odaklı, RSC server-side fetch
2. **admin** (3004) — editöryel + ticari yönetim, middleware-protected
3. **api** (4000) — NestJS REST API, JWT cookie auth
4. **worker** (ayrı PM2 process) — BullMQ processors (AI, mail, newsletter, social) + cron

---

## 4) Veri akışı — nasıl çalışıyor?

### A. Editör bir haber yayınlar (en sık akış)

```
1. Editör admin/login → /ai-studyo
2. Kaynak metni yapıştırır (Reuters, Bloomberg, vs)
3. "AI ile üret" tıklar → Server Action → BullMQ "ai-generation" queue
4. Worker AI Studio'yu çalıştırır: 8 format paralel
   ├─ title (5 varyant)
   ├─ spot (3 varyant)
   ├─ body (500-800 kelime özgün)
   ├─ ai_summary + neden önemli + brand/agency çıkarımları
   ├─ LinkedIn post
   ├─ Instagram carousel (7 slayt)
   ├─ Reels script (30s)
   ├─ SEO meta
   └─ Cover image prompt
5. Editör çıktıları inceler → "Makale taslağı oluştur" → /icerik/yeni
6. TipTap editor'de düzenler → "Yayınla" → PATCH /admin/articles/:id
7. Worker BullMQ "social-post" queue → LinkedIn/IG'a otomatik post
8. Redis cache invalidate → ana sayfa yeniden render
```

### B. Kullanıcı bir haber okur

```
1. Browser → markaradar.com/haber/X
2. Next.js RSC server-side fetch → API /api/v1/articles/X
3. Redis cache hit/miss
4. RSC HTML stream → browser
5. Premium içerikse → user.subscription check → paywall component
6. View count Redis HINCRBY → cron batch ile DB sync
```

### C. Bir okuyucu newsletter'a abone olur

```
1. Web form → Server Action "subscribeToNewsletter"
2. POST /newsletter/subscribe → DB insert (status: pending)
3. Token hash + BullMQ "mail" queue
4. Worker MailProcessor → Resend/SMTP → onay maili
5. Kullanıcı linke tıklar → GET /newsletter/confirm?token=X
6. DB update (status: confirmed)
7. Cron her gün 08:30 → AI ile daily digest compose → tüm confirmed'lere gönder
```

### D. Bir CMO ajans review yazar

```
1. /ajans-rehberi/[slug] → "Review yaz" CTA
2. 4 aşamalı form: reviewer + proje + 5 yıldız + yazılı içerik
3. POST /agencies/X/reviews
4. Backend kontrol:
   ├─ Generic email (gmail/yahoo)? → REJECT
   ├─ Son 6 ayda aynı reviewer aynı ajans? → REJECT
   ├─ IP rate limit (30 gün, max 5 review)? → REJECT
   └─ Content similarity score (LLM eski review'larla) → meta'ya ekle
5. Verification token üret → reviewer'a e-posta
6. Reviewer tıklar → status: email_verified, publicationStatus: submitted
7. Admin /reviews → moderation queue → onayla/reddet/upgrade
8. Onaylanırsa publicationStatus: published, agency rating aggregate güncelle
9. Ajans 14 gün içinde "right to reply" yanıtı verebilir
```

### E. Premium üyelik satın alma

```
1. /premium → 4 tarife (Founding/Lite/Pro/Enterprise)
2. "Üye Ol" tıklar → /login → giriş
3. Yine /premium → CheckoutButton → Server Action startCheckout
4. POST /subscriptions/checkout → Stripe Checkout Session
5. Stripe redirect (checkout.stripe.com)
6. Kullanıcı kart girer → Stripe success → markaradar.com/premium/success
7. Stripe webhook → POST /webhooks/stripe
   ├─ checkout.session.completed → Subscription create (active)
   ├─ invoice.payment_succeeded → Payment record + status: active
   └─ invoice.payment_failed → status: past_due, dunning queue
8. /me dashboard'da artık premium görünür → paywall kalkar
```

### F. Aboneliği iptal etme

```
1. /me → "Yönet" → /me/abonelik
2. Cancellation flow (faz 2): "Neden bırakıyorsun?" anket
3. Dinamik teklif (yıllığa geç, 3 ay pause, kurucu mail vs.)
4. "Yine de iptal et" → POST /subscriptions/cancel
5. Stripe API: cancel_at_period_end = true
6. Dönem sonuna kadar erişim devam → sonra status: expired
```

---

## 5) 7 ana özellik grubu

### 🟢 5.1 EDİTÖRYEL MEDYA (haber + içerik)

**Public web:**
- `/` — ana sayfa: hero + newsletter form + en son 12 haber + premium CTA
- `/haber/[slug]` — makale detay: AI özet + neden önemli + brand/agency çıkarımları + paywall (premium)
- `/kategori/[slug]` — kategori arşivi: AI Marketing, Marka Kampanyaları, Ajans Haberleri, Sosyal Medya, Influencer, Performans, Globalden, Rehberler

**Admin:**
- `/icerik` — makale listesi + status filter (draft/in_review/scheduled/published/archived)
- `/icerik/yeni` — yeni makale (TipTap editor)
- `/icerik/[id]` — düzenle / publish / schedule / unpublish / delete
- `/ai-studyo` — **kaynak → 8 format AI üretim** (ürünün diferansiyon noktası)

**Backend:**
- `Article` model: title, slug, body (HTML), AI alanları (summary, why_matters, brand/agency takeaways, tr_adaptation, ai_human_ratio %), SEO (title, description, canonical, OG), premium/sponsorlu flag'ler
- Cache: 60sn list, 5dk detail (Redis)
- View count: Redis HINCRBY → günlük batch sync
- AI üretim: OpenAI/Anthropic, cost tracking, budget guard (aylık $500 default), 7 günlük cache

### 🟢 5.2 NEWSLETTER ("Pazarlama 5")

**Konsept:** Marketing Brew tarzı, günlük 5 dakikada okunan format. Her sabah 08:30.

**Format:**
- Konu satırı (max 50 karakter + emoji)
- 1 ana hikaye + 4 kısa haber + günün rakamı + ajans hareketleri
- Sonda CTA (premium / akademi / topluluk — haftalık rotasyon)

**Public:**
- Hero altı + footer + premium sayfasında abone formu
- `/newsletter/confirm?token=X` — double opt-in
- `/newsletter/unsubscribe?email=X` — tek tıkla iptal

**Admin:**
- `/newsletter` — abone stats + AI ile **Daily Digest Compose** butonu
- AI compose: son 24 saat en yüksek view'lı 5-10 makale → AI digest format → draft
- "Şimdi gönder" → BullMQ mail queue → confirmed abonelere

**Backend:**
- `NewsletterSubscriber` (pending → confirmed → unsubscribed flow)
- `NewsletterIssue` (draft/scheduled/sending/sent + sponsor pozisyonu + revenue)
- Cron (worker): Pzt-Cum 08:30 daily-digest job

### 🟢 5.3 AJANSRADAR (verified agency directory)

**Konsept:** Clutch.co'nun Türkiye versiyonu. Türkiye'nin **ilk doğrulanmış müşteri review sistemi**.

**Public:**
- `/ajans-rehberi` — listing + filter (tier/city/service/q) + 24'lü grid
- `/ajans-rehberi/[slug]` — ajans profili: rating, services, hakkında, review'lar (verified badge), review yazma formu (4 aşamalı)
- `/ajans-rehberi` ana sayfasında "Top 50 ranking" (review puanına göre)

**Verified Review akışı:**
1. Reviewer formu: ad-soyad + şirket maili + LinkedIn URL + 5 yıldız + 200+ kelime yorum
2. Backend kontrol: generic email reject (gmail/yahoo), IP rate limit, similarity score, 6 ay aynı reviewer reject
3. Email verification linki gönderilir (queue)
4. Reviewer tıklar → email_verified
5. Admin moderation queue → onayla (opsiyonel: "tam doğrulandı" upgrade = editör görüşmesi)
6. Ajans 14 gün içinde "right to reply" verebilir

**Admin:**
- `/ajans` — liste + Top 50 ranking + **inline tier değiştir** (free/basic/premium/featured/elite)
- `/ajans/yeni` — yeni ajans formu
- `/reviews` — review moderation queue (yıldız + benzerlik skoru + onayla/reddet/upgrade)

**Backend:**
- `Agency` model + tier (12 ay dolan tier paketleri)
- `AgencyReview` + verification_status (pending → email_verified → fully_verified) + publication_status (submitted → published)
- Anti-fraud: domain mismatch, IP limit, content similarity (token Jaccard)

### 🟢 5.4 İŞ İLANLARI + EMPLOYER BRAND

**Konsept:** Built In modelinin Türkiye versiyonu. Single job listing değil, employer brand microsite paketi.

**Public:**
- `/is-ilanlari` — listing + filter (seniority/remote/category/q)
- `/is-ilanlari/[slug]` — ilan detay + apply CTA (URL veya mailto)
- `/isveren/[slug]` (faz 2) — employer brand microsite (about + values + perks + team photos + active jobs)

**Plan'lar:**
- **Basic** — 1.490 TL · sadece site
- **Featured** — 3.490 TL · site + 1 LinkedIn post
- **Premium Distribution** — 6.990 TL · site + LinkedIn + IG + WhatsApp + newsletter
- **Employer Brand** — 49.900-149.900 TL/yıl · microsite + sınırsız ilan

**Admin:**
- `/is-ilanlari` — liste + status filter
- `/is-ilanlari/yeni` — kategori/seviye/maaş/uzaktan/plan seçimi

**Backend:**
- `JobPost` (status: pending/active/expired/filled/withdrawn) + viewCount + applyCount
- Otomatik expire (cron: 30 gün sonra)
- `EmployerBrand` (starter/growth/premium plan + microsite verisi)

### 🟢 5.5 MARKARADAR+ PREMIUM SUBSCRIPTION

**4 Tarife:**

| Tarife | Yıllık | Aylık | Kapsam |
|---|---|---|---|
| **Founding Member** | $49 | — | İlk 200 üye, lifetime fiyat kilidi, Pro + rozet |
| **Lite** | $99 | $9 | Deep dive haftalık + rapor arşiv + reklamsız |
| **Pro** | $499 | $49 | Lite + CMO Club Slack + aylık webinar + Endeks |
| **Enterprise** | $2999 | — | Pro × 5 koltuk + custom rapor + QBR |

**Akış:**
1. `/premium` — pricing sayfası, "En popüler: Pro" highlight
2. `/login` (gerekirse) → "Üye Ol" → Stripe Checkout
3. Stripe webhook → DB subscription create → /me/abonelik

**Premium fayda örneği:** Article paywall — makalenin %80'i blur, "Premium üye ol" CTA. Pro+ üye girişte tam okuma.

**Dunning (faz 2 worker):**
- Ödeme başarısız → status: past_due → nextRetryAt (1, 3, 7, 14 gün exponential)
- 3 retry sonrası → mail "Premium erişimin kapanır" → expired

**Cancellation save flow (faz 2):**
- "Neden bırakıyorsun?" anket → dinamik teklif (aylık, pause, kurucu DM)
- Sonra hâlâ iptal → cancelAtPeriodEnd + dönem sonu erişim

**Backend:**
- `Subscription` (trialing/active/past_due/canceled/expired/paused) + provider (stripe/iyzico/manual) + cancelAtPeriodEnd
- `Payment` log
- `WebhookEvent` idempotency

### 🟢 5.6 MARKARADAR AKADEMİ

**Konsept:** Marketing Week Mini MBA + Maven hibrit. En yüksek margin ürün.

**Ürünler:**
- **AI Marketing Mini MBA** — 8 hafta, 30-50 kişi, 9.900 TL (early bird 7.900 TL)
- **Sosyal Medya Profesyonelliği** — 6 hafta, 5.900 TL
- **CMO için AI** — 1 günlük workshop, 2.990 TL
- **Kurumsal in-house** — 50-150K TL/oturum
- **Self-paced** — 1.990 TL

**Public:**
- `/akademi` — kurs kataloğu + her kursun yaklaşan kohortu + early bird CTA
- `/akademi/[slug]` — detay sayfası: outcomes + cohort listesi + sticky pricing card

**Admin:**
- `/akademi` — kurs + kohort listesi
- `/akademi/yeni-kurs` — yeni kurs (format, level, fiyat, kapasite)
- `/akademi/[id]/yeni-kohort` — kohort aç (tarih, kapasite, Zoom link)

**Akış:**
1. Kullanıcı kurs detay → "Kayıt ol" (login zorunlu)
2. Kohort enroll → DB record + payment intent
3. Admin "mark-paid" → status: paid
4. Kohort başlangıcında Zoom link gönderilir
5. Tamamlananlara sertifika + LinkedIn badge

**Backend:**
- `Course` + `CourseCohort` (open/full/in_progress/completed/canceled) + `CourseEnrollment`

### 🟢 5.7 ETKİNLİK + ÖDÜL PROGRAMI

**Türkiye AI Marketing Ödülleri** (yıllık) + flagship zirve + webinar serisi.

**Etkinlik tipleri:**
- `summit` — yıllık zirve (500-800 kişi, 1.490-3.990 TL bilet)
- `awards` — ödül töreni (başvuru: 990-2.990 TL, jüri scoring)
- `webinar` — premium üye webinar'ı
- `workshop` — Mini MBA seminerleri
- `meetup` — küçük networking

**Public:**
- `/etkinlikler` — etkinlik takvimi
- `/etkinlikler/[slug]` — detay + bilet satın al + (awards için) başvuru formu

**Admin:**
- `/etkinlikler` — liste + jüri sayfası link
- `/etkinlikler/yeni` — yeni etkinlik form
- `/etkinlikler/[id]/jury` — award submissions + jury scoring + winner ilanı

**Bilet + QR check-in:**
- `buyTicket` → unique QR code üretilir
- Etkinlik gününde QR scan → `checkInTicket` (mobile UI faz 2)

---

## 6) Diğer özellikler (destekleyici sistemler)

### 6.1 AI Stüdyo (ana diferansiyon)

Strateji 8.x'teki 9 prompt:
- **title** — 5 başlık varyantı (haber/soru/veri/analitik/kısa)
- **spot** — 3 spot varyantı (200-280 karakter)
- **body** — 500-800 kelime özgün haber gövdesi
- **ai_summary** — 3 madde özet + neden önemli + brand/agency çıkarımı + TR adaptasyon
- **linkedin_post** — 800-1300 karakter LinkedIn postu
- **instagram_carousel** — 7 slayt
- **reels_script** — 30 saniye TikTok/Reels script
- **seo_meta** — 55-60 char title + 150-160 char description
- **cover_image_prompt** — DALL-E/Midjourney prompt

**Multi-provider:** OpenAI ana, Anthropic yedek. Provider seçimi env veya UI'dan.

**Cost tracking:** Her çağrı `ai_generations` tablosuna loglanır. Aylık bütçe (`AI_MONTHLY_BUDGET_USD=500` default) aşılırsa 503.

**Cache:** Aynı vars için 7 gün Redis cache (MD5 hash key).

### 6.2 Mail Sistemi (gelen + giden)

**Hazal projesinden alındı:**
- IMAP fetch (kurucu inbox'unu admin'de görür)
- SMTP + Resend hibrit gönderim
- `EmailMessage` tablosu (INBOUND/OUTBOUND) + threadKey

**Auth + Newsletter mail'leri** queue üzerinden → MailProcessor → Resend/SMTP.

### 6.3 Takvim

**Hazal + Pure hibridi:**
- `CalendarEvent` (EDITORIAL/MEETING/EVENT/WEBINAR/COURSE_SESSION/CAMPAIGN/REMINDER)
- `attendees: String[]` (Pure pattern)
- **iCalendar (.ics) feed** — public, Google Calendar'a abone olunabilir

### 6.4 Yorumlar + Bookmarks

- `Comment` — nested replies + upvote + report + moderation (pending/approved/rejected/spam)
- `Bookmark` — 4 kaynak tipi (article/agency/job/report) + notes

### 6.5 Türkiye Pazarlama Endeksi (proprietary data)

**Konsept:** YouGov / eMarketer Pulse modelinin Türkiye versiyonu. Aylık 300 CMO panel araştırma.

- `ResearchPanelMember` — opt-in, honorarium method (premium credit/cash)
- `ResearchSurvey` — questions + fieldedAt + closedAt + responseCount
- Premium ürün — aylık abonelik $5K-15K/yıl kurumsal müşteri

### 6.6 Reklam + Sponsorlu içerik

- `Advertiser` + `AdCampaign` (banner/sponsored_content/newsletter/native)
- `AdSlot` — placement (homepage_top, category_top, article_inline, sidebar_sticky, mobile_sticky, newsletter_top)
- Weighted random slot serving + impression/click tracking
- Public: `/api/v1/ads/slot/:placement` → slot getir, `/api/v1/ads/click/:slotId` → redirect + count

### 6.7 Topluluk (CMO Club Slack)

- `CommunityMember` — Slack user ID + badges
- Pro+ üyelik şart
- Auto-invite (faz 2: Slack SCIM API)

### 6.8 KVKK / GDPR

- `/me` → verilerini export et (ZIP olarak JSON) — `apiFetch("/me/export")`
- `/me/sil` → 30 gün geri alma penceresi + anonymize
- Audit log — kim ne yaptı (KVKK m.11 + iç güvenlik)
- Cookie consent banner (faz 2)

### 6.9 Social posting (LinkedIn/IG/X)

- AI Studio çıktısından otomatik draft (`SocialPost` model)
- Admin'de `/social` (faz 2) — schedule + edit + manuel post
- BullMQ social-post queue → external API çağrısı (LinkedIn/Buffer/IG)

### 6.10 Search

- Postgres FTS (ILIKE şu an, faz 2'de tsvector + GIN)
- Birleşik arama: articles + agencies + jobs + courses

---

## 7) Kullanıcı flow'ları (end-to-end)

### Flow 1: Yeni okuyucu → Newsletter abonesi → Premium üye

```
1. Google'dan "AI marketing Türkiye" araması
2. /haber/[slug] organic landing
3. Article paywall'a kadar oku (premium içerik ise)
4. Hero altındaki newsletter formuna abone ol
5. Onay maili → tıkla → confirmed
6. Yarın 08:30 ilk "Pazarlama 5" mail al
7. 14 gün okuyup değer alır → /premium → Pro üyelik
8. Stripe Checkout → $499 yıllık
9. Premium içeriklere erişim + CMO Club Slack davet maili
10. Aylık webinar bildirimi alır
```

### Flow 2: Editör günlük operasyon

```
07:30 — Sektör haberleri tara (Reddit, X, LinkedIn)
08:00 — Newsletter daily digest onay (admin'de "AI ile üret" → "Gönder")
08:30 — Newsletter abonelere gider (worker)
09:00 — Önemli haberi /ai-studyo'da işle
09:15 — 8 format AI üretildi → "Makale taslağı oluştur"
09:20 — TipTap editor'de düzenle → "Yayınla"
09:25 — Sosyal medya postu otomatik LinkedIn'e
10:00 — Review moderation queue (3-5 review)
10:30 — Sponsorlu içerik teklifi (Sales ekibi)
```

### Flow 3: Ajans sahibi (yeni müşteri kazanma)

```
1. LinkedIn'de MarkaRadar post görür → /ajans-rehberi
2. Kendi ajansını ararken bulamaz → "Sizi listeleyelim" formu
3. /ajans/yeni → temel bilgileri girer (sales onayında)
4. Free tier'da görünür ama review yok → trafiği düşük
5. 5 mevcut müşterisine review link gönderir
6. Her review için reviewer mail doğrulama
7. Admin moderation onayı → review yayında
8. Rating 4.5+ olunca Top 50'ye girer → SEO boost
9. Sales görüşmesi → Premium tier ($2.490 TL/ay) upgrade
10. Anasayfa carousel'de + monthly newsletter spot
```

### Flow 4: Kurumsal (Mini MBA) eğitim alıcı

```
1. /akademi'de "AI Marketing Mini MBA" görür
2. /akademi/ai-marketing-mini-mba → 8 haftalık syllabus + outcomes
3. Erken kayıt fiyatı (7.900 TL) görünür
4. /login → /register (yoksa) → kayıt
5. Kohort'a "Kayıt ol" → enrollment created
6. Stripe ödeme → status: paid
7. Kohort başlangıcında welcome maili + Zoom linki
8. 8 hafta canlı + Slack ile etkileşim
9. Final project → sertifika + LinkedIn badge
10. Alumni Slack lifetime erişim → networking
```

---

## 8) Admin panel — kim ne yapar?

| Rol | Yetki | Kullandığı sayfalar |
|---|---|---|
| **super_admin** | Hepsi | Tüm sayfalar |
| **editor** | İçerik + moderasyon | /icerik, /ai-studyo, /newsletter, /reviews, /yorumlar, /akademi |
| **writer** | Article CRUD | /icerik, /ai-studyo |
| **social_manager** | Social + AI | /ai-studyo, social posts (faz 2) |
| **sales** | Ajans + iş ilanı + employer | /ajans, /is-ilanlari, /etkinlikler bilet |

Middleware her route'u cookie kontrolüne sokar, layout'ta double-check role.

---

## 9) Ürün özellikleri liste — Tek bakışta

### Backend (149 endpoint, 38 Prisma model, 28 modül)

```
🟢 Foundation
   • AllExceptionsFilter (Prisma error mapping)
   • RolesGuard + @Roles decorator
   • AuditLog + interceptor
   • Sentry init + capture
   • PaginationDto + Slug util
   • Helmet + CORS + Throttler (auth strict 5 req/dk)

🟢 Auth
   • JWT (httpOnly cookie) + refresh token rotation
   • Email verification (token table)
   • Password reset
   • Logout-all (tüm cihazlar)

🟢 İçerik
   • Article CRUD + publish/schedule
   • Category + Tag yönetimi
   • TipTap content + AI alanları
   • View count (Redis HINCRBY → batch sync)
   • Cache layer (60s list, 5dk detail)
   • Slug auto-generate (Türkçe karakter dahil)

🟢 Mail (hazal projesinden)
   • IMAP fetch (inbox göster)
   • SMTP + Resend hibrit
   • EmailMessage threading
   • Queue üzerinden gönderim

🟢 Calendar (hazal+pure hibridi)
   • EDITORIAL/MEETING/EVENT type'ları
   • iCalendar .ics feed (public)
   • attendees array

🟢 Newsletter
   • Subscriber + double opt-in
   • Daily digest AI compose
   • Cron 08:30 Pzt-Cum
   • Open/click tracking (faz 2)

🟢 Subscription
   • Stripe + iyzico (TR)
   • 4 tier (Founding/Lite/Pro/Enterprise)
   • Webhook idempotency
   • Dunning (3 retry exponential)
   • Cancellation flow

🟢 AI Studio
   • 9 prompt template (Türkçe)
   • OpenAI + Anthropic multi-provider
   • Cost tracker + monthly budget guard
   • 7 gün cache (MD5 hash)
   • Generate all (8 format paralel)

🟢 Storage
   • MinIO (dev) + R2 (prod)
   • Sharp resize (3 variant: thumb/card/hero)
   • Presigned upload + download

🟢 Agencies + Reviews
   • 5 tier (free → elite)
   • Verified reviews (Clutch flow)
   • Email + LinkedIn doğrulama
   • Anti-fraud (similarity, IP limit)
   • Moderation queue + right to reply
   • Top 50 ranking

🟢 Jobs + Employer Brand
   • 3 paket (basic/featured/premium_distribution)
   • Otomatik 30 gün expire
   • Apply tracking
   • Employer microsite

🟢 Courses + Cohorts
   • 3 format (online_cohort/self_paced/in_person)
   • Enrollment + payment
   • Status state machine

🟢 Events + Awards
   • 5 tip (summit/awards/webinar/workshop/meetup)
   • Award submission + jury scoring
   • Bilet + QR check-in

🟢 Reports
   • Premium PDF mağazası
   • Signed download URL
   • Tier-based erişim

🟢 Research Panel
   • Aylık 300 CMO anketi
   • Survey + response tracking
   • Türkiye Pazarlama Endeksi

🟢 Social Posting
   • SocialPost (8 channel)
   • AI Studio entegrasyonu
   • BullMQ scheduled publish

🟢 Ads
   • Banner + sponsorlu içerik
   • Weighted random serving
   • Click tracking + redirect

🟢 Search
   • Postgres ILIKE (faz 1)
   • Birleşik: articles + agencies + jobs + courses

🟢 GDPR / KVKK
   • Data export (ZIP JSON)
   • Right to be forgotten (30 gün + anonymize)
   • Audit log

🟢 Community
   • CMO Club Slack
   • Pro+ üyelik şart
   • Badge sistemi

🟢 Comments + Bookmarks
   • Nested replies + moderation
   • 4 kaynak bookmark tipi

🟢 Worker (BullMQ)
   • Mail processor (queue ile retry)
   • AI processor (uzun süren işler)
   • Social processor (zamanlanmış post)
   • Newsletter processor (daily digest)
   • Maintenance (view sync, scheduled publish, expire jobs)
   • Hourly dunning retry

🟢 Cron schedule
   • 08:30 Pzt-Cum → newsletter daily digest
   • Saatlik → subscription dunning
   • 02:00 → view counter batch sync
   • 09:00 → expired job archive
```

### Web (Public site — 25+ sayfa)

```
/                          Ana sayfa + hero + newsletter form
/haber/[slug]              Article detail + AI özet + paywall
/kategori/[slug]           Kategori arşivi
/ajans-rehberi             Listing + filter
/ajans-rehberi/[slug]      Agency detail + reviews + review form
/is-ilanlari               Job listing + filter
/is-ilanlari/[slug]        Job detail + apply
/akademi                   Course catalog
/akademi/[slug]            Course detail + enroll
/premium                   4 tier pricing + Stripe checkout
/me                        User dashboard (subscription + bookmarks)
/login + /register         Auth flow
/forgot-password           Password reset request
/reset-password            New password form
/auth/verify               Email verification
/hakkimizda                About
/kvkk                      KVKK aydınlatma
/gizlilik                  Privacy
/kullanim-kosullari        Terms
/not-found                 404
```

### Admin (Yönetim paneli — 19 sayfa)

```
/login                     Role-based login
/                          Dashboard
/analitik                  AI cost + traffic + content stats
/icerik                    Article list + status filter
/icerik/yeni               TipTap editor + AI fields
/icerik/[id]               Düzenle / publish / delete
/ai-studyo                 Kaynak → 8 format paralel
/yorumlar                  Comment moderation queue
/newsletter                AI compose + send
/raporlar                  Premium PDF mağazası
/ajans                     Ajans CRUD + Top 50 + inline tier
/ajans/yeni                Yeni ajans formu
/reviews                   Verified review moderation
/is-ilanlari               Job CRUD + status filter
/is-ilanlari/yeni          Detaylı ilan formu
/akademi                   Kurs + kohort yönetimi
/akademi/yeni-kurs         Yeni kurs (format, fiyat, kapasite)
/akademi/[id]/yeni-kohort  Kohort aç (tarih, Zoom, kapasite)
/etkinlikler               Event list + jüri sayfası link
/etkinlikler/yeni          Yeni etkinlik formu
/premium                   Subscription özeti
```

---

## 10) Faz haritası (zamanlama)

### Faz 1 — Lansman (ay 1-3) ✅ Kod hazır
- Newsletter daily digest cron
- Article + Ajans rehberi public
- AI Studio + premium subscription
- Verified review moderation

### Faz 1.5 — Pekiştirme (ay 4-6)
- Akademi Mini MBA Kohort 1 (ay 7-8)
- Verified review program lansmanı (50 ajans pilot)
- MarkaRadar+ Founding Member 200 üye

### Faz 2 — Büyüme (ay 9-12)
- Türkiye AI Marketing Ödülleri (ay 9 duyuru, ay 12 tören)
- iyzico gerçek entegrasyon
- LinkedIn/Buffer API (multi-channel post)
- Community Slack auto-invite

### Faz 3 — Genişleme (ay 12-24)
- BrandSignal.ai (İngilizce versiyon, MENA)
- Mobile app (React Native + push)
- Meilisearch (search scale)
- Inngest cron migration (durable workflows)

---

## 11) Hızlı başlangıç — geliştirme ortamı

```bash
# Tek seferlik
cd ~/Desktop/brand
make up                    # postgres + redis + minio + mailhog
make install               # 3 uygulamaya yarn install
cp api/.env.example api/.env.local       # JWT_SECRET ekle
cp web/.env.example web/.env.local
cp admin/.env.example admin/.env.local
make migrate
make seed                  # admin@markaradar.com / admin12345

# Her gün
make api                   # API :4000
make worker                # Worker (BullMQ + cron)
make web                   # Web :3003
make admin                 # Admin :3004
```

**Production için doldurulacak env'ler:**
- `OPENAI_API_KEY` — AI Studio
- `ANTHROPIC_API_KEY` — fallback
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — premium ödeme
- `RESEND_API_KEY` — production mail
- `SENTRY_DSN` — error tracking
- `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` — TR ödeme (faz 2 full impl.)
- `BEEHIIV_API_KEY` — newsletter mass send (opsiyonel)

---

## 12) Mevcut sayılar

```
📊 Backend
   149 REST endpoint
   38 Prisma model
   28 modül
   8 migration
   14 vitest test (slug + tiers)
   1 worker process (BullMQ + cron)

📊 Web (public)
   25+ sayfa
   13 Server Action
   6 shadcn primitive
   Login + register + verify + reset + me dashboard
   Review submit form (4 step)
   Stripe checkout flow

📊 Admin
   19 sayfa
   3 form (article, agency, job, course, cohort, event)
   AI Studio (kaynak → 8 format UI)
   TipTap editor
   Review moderation queue
   Newsletter composer
   Top 50 ranking + inline tier
   Analitik (AI cost + budget bar)

📊 Sistem
   Postgres + Redis + MinIO + MailHog (Docker)
   API + Worker (PM2 cluster prod)
   Yarn 1.22 paket yöneticisi
```

---

**Kısa cevap "ne yapıyor":** Türkiye'nin pazarlama profesyonellerine günlük 5 dakikalık AI-destekli editöryel bülten + doğrulanmış ajans rehberi + premium analitik + eğitim akademisi + ödül programı sunan, AI-native bir medya ekosistemi.

**Dünyada eşi yok mu?** Marketing Brew + Clutch + Stratechery + Marketing Week birleşmiş gibi — ama Türkiye için, Türkçe, AI-native, founder-led.
