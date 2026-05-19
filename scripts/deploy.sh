#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# MarkaRadar — Quick deploy (sonraki push'lar için)
#
# Kullanım (sunucuda /var/www/marketing-brand altında):
#   ./scripts/deploy.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/marketing-brand}"
cd "$APP_DIR"

echo "═══ Git pull"
git pull origin main

echo ""
echo "═══ API"
cd api
yarn install --frozen-lockfile --production=false
yarn prisma generate
yarn prisma db push --skip-generate
yarn build

# standalone build artifacts'i kopyalayan helper
copy_standalone_artifacts() {
  # 1. Static (zorunlu — chunks ve fontlar)
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  # 2. Public (favicon, robots, vb.)
  cp -r public .next/standalone/ 2>/dev/null || true
  # 3. Server artifacts — middleware-manifest, server-action-manifest, vb.
  #    Next 15'te bazen otomatik kopyalanmıyor (middleware varsa kritik)
  if [ -d .next/server ]; then
    mkdir -p .next/standalone/.next/server
    cp -rn .next/server/* .next/standalone/.next/server/ 2>/dev/null || true
  fi
}

echo ""
echo "═══ Web"
cd ../web
yarn install --frozen-lockfile --production=false
NEXT_OUTPUT_STANDALONE=true yarn build
copy_standalone_artifacts

echo ""
echo "═══ Admin"
cd ../admin
yarn install --frozen-lockfile --production=false
NEXT_OUTPUT_STANDALONE=true yarn build
copy_standalone_artifacts

echo ""
echo "═══ PM2 reload (zero-downtime)"
cd "$APP_DIR"
pm2 reload ecosystem.config.js
pm2 save

echo ""
echo "═══ Sağlık kontrolü"
sleep 3
curl -sf http://127.0.0.1:4010/health >/dev/null && echo "✓ API" || echo "✗ API"
curl -sf http://127.0.0.1:3013 >/dev/null && echo "✓ Web" || echo "✗ Web"
curl -sf http://127.0.0.1:3014 >/dev/null && echo "✓ Admin (veya 307)" || echo "✗ Admin"

echo ""
echo "✓ Deploy tamam"
