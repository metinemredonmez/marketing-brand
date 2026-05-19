# 🚀 MarkaRadar — Launch Checklist (Tek Sayfa)

> Production'a alırken sırayla bu adımları yap. ~2-3 saat sürer.

---

## 1. Anahtarlar topla (30 dk — paralel sekmelerden)

| Servis | URL | Aktivasyon |
|---|---|---|
| **OpenAI** | https://platform.openai.com/api-keys | $20 başlangıç kredisi yatır |
| **Sentry** | https://sentry.io | Org aç → 3 project (api/web/admin) → 3 DSN |
| **Resend** | https://resend.com | Domain ekle → DKIM kayıtlarını al |
| **Cloudflare R2** | https://dash.cloudflare.com/?to=/:account/r2 | Bucket aç → API token |
| **Plausible** | https://plausible.io | Site ekle → domain → script ID |
| **Stripe** | https://dashboard.stripe.com | Business hesap + 4 product + webhook secret |
| **iyzico** *(TR)* | https://merchant.iyzipay.com | TR merchant başvuru (1-3 gün) |

---

## 2. Domain + Cloudflare (15 dk)

```bash
# Domain satın al (Cloudflare Registrar veya başka):
markaradar.com   →  $10/yıl

# Cloudflare DNS'e ekle, sonra DNS records:
markaradar.com        A      <Vercel-IP or VPS-IP>
www.markaradar.com    CNAME  cname.vercel-dns.com
admin.markaradar.com  CNAME  cname.vercel-dns.com
api.markaradar.com    CNAME  <railway>.up.railway.app   # veya A → VPS IP
media.markaradar.com  CNAME  <r2-account>.r2.dev

# SSL/TLS → Full (strict)
# Security → WAF → Managed Rules ON
```

---

## 3. Secrets üret (1 dk)

```bash
cd ~/Desktop/marketing-brand
./scripts/generate-secrets.sh > .env.prod.secrets
# Çıktıyı oku — bu değerleri .env.prod'a kopyalayacaksın
cat .env.prod.secrets
```

---

## 4. .env.prod dosyasını oluştur (5 dk)

```bash
cp .env.prod.example .env.prod

# .env.prod'u düzenle:
# - .env.prod.secrets'tan POSTGRES_PASSWORD, REDIS_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET
# - Adım 1'den OPENAI_API_KEY, RESEND_API_KEY, R2_*, SENTRY_DSN, vb.
# - Adım 2'den WEB_DOMAIN, API_DOMAIN, ADMIN_DOMAIN
```

---

## 5. Pre-deploy check (1 dk)

```bash
./scripts/deploy-check.sh .env.prod
# Hata varsa hangi key eksik söyler. ✗ olmayana kadar düzelt.
```

---

## 6. Deploy seç → komut çalıştır

### Yol A — Railway + Vercel (önerilen)
```bash
# Railway dashboard'dan repo bağla, env'leri yapıştır.
# Sonra:
railway login
railway link
railway up --service api
railway run --service api -- yarn prisma migrate deploy

# Vercel:
cd web && vercel --prod
cd ../admin && vercel --prod
```

### Yol B — Self-hosted VPS
```bash
# Sunucuya SSH gir, clone et, .env.prod'u koy:
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml exec api yarn prisma migrate deploy
```

---

## 7. Smoke test (5 dk)

```bash
curl https://markaradar.com/                       # → 200
curl https://api.markaradar.com/api/v1/articles    # → 200, JSON
curl https://admin.markaradar.com/                 # → 307 (login redirect)
curl https://markaradar.com/sitemap.xml            # → XML
curl https://markaradar.com/robots.txt             # → text
curl "https://markaradar.com/api/og?title=Test"    # → PNG
```

Admin'de demo verisi görmek istersen:
```bash
# Railway:
railway run --service api -- yarn prisma db seed

# VPS:
docker compose -f docker-compose.prod.yml exec api yarn prisma db seed
```

---

## 8. Post-launch

- [ ] Google Search Console'a domain ekle + sitemap submit
- [ ] Lighthouse run: Performance > 80, SEO > 95, A11y > 90
- [ ] Sentry'de bir test error tetikle → görünüyor mu doğrula
- [ ] Plausible/PostHog: ilk pageview geliyor mu
- [ ] Resend: test e-posta gönder
- [ ] Stripe: $1 test ödeme + webhook delivery
- [ ] DB backup ilk gece çalıştı mı? `ls -la backups/`
- [ ] DNS propagation: https://dnschecker.org
- [ ] Mobile test: Safari iOS, Chrome Android

---

## 9. Yasal kapatma (1 hafta içinde)

- [ ] **VERBİS** kaydı — https://verbis.kvkk.gov.tr (KVKK zorunlu)
- [ ] **Stripe/iyzico DPA** imzalama
- [ ] **e-Arşiv fatura** entegrasyonu (BulutFatura/Mikro)
- [ ] **Çerez consent banner** uyum kontrolü → bir avukatla 1 saatlik review

---

## 🎯 Hedef metrikleri (ilk 30 gün)

- Aylık tekil ziyaretçi: 5K → 15K → 50K
- Newsletter abonesi: 100 → 500 → 2K
- Premium üye dönüşüm: %1-3
- Brand Studio kayıtlı marka: 5-10

---

## 🆘 Sorun olursa

| Sorun | Çözüm |
|---|---|
| `EADDRINUSE :::4000` | `lsof -ti :4000 \| xargs -r kill -9` |
| Prisma migration hatası | `yarn prisma migrate resolve --rolled-back <NAME>` |
| Caddy cert alamıyor | DNS Cloudflare proxy'yi "DNS only" yap (gri bulut) |
| Build OOM (Vercel) | Build mem'i `NEXT_BUILD_NODE_OPTIONS="--max-old-space-size=4096"` |
| Sentry source map yok | `SENTRY_AUTH_TOKEN` ekle, `withSentryConfig` source map upload yapar |
