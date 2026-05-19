# MarkaRadar Web

Next.js 15 (App Router, React 19) — public site.

**Port:** `3003`

## Geliştirme

```bash
# Root klasörden Docker + API hazır olmalı
cd ..
make up           # postgres + redis + minio
make api &        # api başlat (arka plan)
make web          # bu app'i başlat

# Veya manuel
cd web
yarn install
cp .env.example .env.local
yarn dev
```

## Yapı

```
src/
├── app/
│   ├── (marketing)/        # public sayfalar (header + footer)
│   │   ├── page.tsx        # ana sayfa
│   │   ├── haber/[slug]/
│   │   ├── kategori/[slug]/
│   │   ├── ajans-rehberi/
│   │   ├── is-ilanlari/
│   │   ├── akademi/
│   │   └── premium/
│   ├── (auth)/             # login/register
│   ├── layout.tsx          # root layout (fonts, metadata)
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn primitives (button, card, ...)
│   ├── layout/             # header, footer, nav
│   ├── article/            # ArticleCard, ArticleBody
│   └── marketing/          # hero, cta, newsletter form
├── lib/
│   ├── api/                # backend API client (server-only)
│   ├── hooks/              # React Query hooks
│   └── utils.ts
└── types/
```

## Backend bağlantısı

`src/lib/api/client.ts` — RSC fetch wrapper, cookie forward, ISR revalidate.

`NEXT_PUBLIC_API_URL=http://localhost:4000` (.env.local)

## Sıradaki

- [ ] shadcn/ui kurulum (button, card, dialog, form)
- [ ] Newsletter abone form (server action)
- [ ] Login/register sayfaları
- [ ] Kategori + ajans rehberi sayfaları
- [ ] Premium paywall component
- [ ] Sitemap + RSS

## Production

Vercel önerisi (otomatik deploy). Self-host alternatif:

```bash
yarn build
yarn start
# veya pm2 start --name markaradar-web -- start
```
