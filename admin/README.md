# MarkaRadar Admin

Next.js 15 — editöryel ve ticari yönetim paneli.

**Port:** `3004`
**robots.txt:** noindex (private)

## Geliştirme

```bash
cd ..
make up
make api &
make admin
# → http://localhost:3004
```

## Yapı

```
src/
├── app/
│   ├── (dashboard)/          # auth korumalı sayfalar
│   │   ├── page.tsx          # dashboard
│   │   ├── icerik/           # makale CRUD
│   │   ├── ai-studyo/        # AI üretim
│   │   ├── ajans/            # ajans yönetimi
│   │   ├── reviews/          # review moderasyon kuyruğu
│   │   ├── newsletter/       # newsletter editor
│   │   ├── premium/          # subscription yönetimi
│   │   ├── analitik/
│   │   └── kullanicilar/
│   ├── (auth)/login/
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn
│   └── dashboard/            # sidebar, topbar, vb.
└── lib/
```

## Yetkilendirme

Tüm `(dashboard)` rotaları JWT ile korunmalı:
- `super_admin`, `editor`, `writer`, `social_manager`, `sales` rolleri erişebilir
- `reader`, `agency_user`, `brand_user` erişemez

## Sıradaki

- [ ] Server-side auth middleware
- [ ] AI Stüdyo sayfası (kaynak gir → 8 format)
- [ ] Article CRUD form (TipTap editor)
- [ ] Review moderasyon kuyruğu UI
- [ ] Newsletter composer
- [ ] Analitik chart'lar (Recharts)
