#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# MarkaRadar — VPS first-time setup (Ubuntu 22.04/24.04)
#
# Bu script:
#   1. /var/www/marketing-brand'a clone
#   2. Postgres + Redis kurulum (yoksa)
#   3. Node 20 (nvm üzerinden veya nodesource)
#   4. Yarn install + Prisma migrate + seed
#   5. Build (3 app)
#   6. PM2 start + save + startup
#   7. Nginx config link + reload
#   8. certbot ile TLS (opsiyonel)
#
# Kullanım (root veya sudo'lu user ile):
#   curl -fsSL https://raw.githubusercontent.com/metinemredonmez/marketing-brand/main/scripts/server-setup.sh | bash
#   VEYA
#   ./scripts/server-setup.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/metinemredonmez/marketing-brand.git}"
APP_DIR="${APP_DIR:-/var/www/marketing-brand}"
NODE_VERSION="${NODE_VERSION:-20}"
DOMAIN="${DOMAIN:-markaradar.com}"

bold() { printf "\n\033[1;34m═══ %s\033[0m\n" "$1"; }
ok() { printf "\033[0;32m✓\033[0m %s\n" "$1"; }
warn() { printf "\033[0;33m⚠\033[0m %s\n" "$1"; }
err() { printf "\033[0;31m✗\033[0m %s\n" "$1"; }

# ───────────────────────── 1. Sistem paketleri
bold "Sistem paketleri"
apt-get update -qq
apt-get install -y -qq curl git build-essential ca-certificates gnupg lsb-release ufw
ok "Temel paketler kuruldu"

# ───────────────────────── 2. Node.js 20
bold "Node.js $NODE_VERSION"
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_VERSION" ]; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y -qq nodejs
fi
npm install -g yarn pm2
ok "Node $(node -v), Yarn $(yarn -v), PM2 $(pm2 -v)"

# ───────────────────────── 3. Postgres
bold "PostgreSQL"
if ! command -v psql >/dev/null; then
  apt-get install -y -qq postgresql postgresql-contrib
  systemctl enable --now postgresql
fi
ok "Postgres aktif"

# DB + user oluştur (idempotent)
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='markaradar'" | grep -q 1; then
  PG_PASS="$(openssl rand -base64 24 | tr -d '/+=')"
  sudo -u postgres psql -c "CREATE USER markaradar WITH PASSWORD '${PG_PASS}';"
  sudo -u postgres psql -c "CREATE DATABASE markaradar_prod OWNER markaradar;"
  echo "${PG_PASS}" > /root/.markaradar_pgpass
  chmod 600 /root/.markaradar_pgpass
  ok "Postgres user/db oluşturuldu — şifre /root/.markaradar_pgpass'da"
else
  PG_PASS="$(cat /root/.markaradar_pgpass 2>/dev/null || echo 'CHANGE_ME')"
  ok "Postgres user/db zaten var"
fi

# ───────────────────────── 4. Redis
bold "Redis"
if ! command -v redis-cli >/dev/null; then
  apt-get install -y -qq redis-server
  systemctl enable --now redis-server
fi
ok "Redis aktif"

# ───────────────────────── 5. Repo clone
bold "Repo"
if [ ! -d "$APP_DIR" ]; then
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
  ok "Clone: $APP_DIR"
else
  cd "$APP_DIR"
  git pull
  ok "Pull: $APP_DIR"
fi
cd "$APP_DIR"

# ───────────────────────── 6. .env.prod (yoksa şablon)
bold ".env.prod"
if [ ! -f .env.prod ]; then
  cp .env.prod.example .env.prod
  # Otomatik secret ekle
  JWT_SECRET="$(openssl rand -base64 48 | tr -d '\n' | tr '/+' '_-')"
  JWT_REFRESH_SECRET="$(openssl rand -base64 48 | tr -d '\n' | tr '/+' '_-')"
  REDIS_PASSWORD=""  # local Redis, default password yok
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env.prod
  sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|" .env.prod
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${PG_PASS}|" .env.prod
  warn "  .env.prod oluşturuldu — kalan key'leri elle doldur:"
  warn "  nano $APP_DIR/.env.prod"
  warn "  (OpenAI, Resend, Sentry, Stripe vb.)"
else
  ok ".env.prod zaten var"
fi

# API için ayrı .env
if [ ! -f api/.env ]; then
  cat > api/.env <<EOF
NODE_ENV=production
PORT=4010
APP_URL=https://api.$DOMAIN
DATABASE_URL=postgresql://markaradar:${PG_PASS}@localhost:5432/markaradar_prod
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=$(grep '^JWT_SECRET=' "$APP_DIR/.env.prod" | cut -d= -f2-)
JWT_REFRESH_SECRET=$(grep '^JWT_REFRESH_SECRET=' "$APP_DIR/.env.prod" | cut -d= -f2-)
COOKIE_DOMAIN=.$DOMAIN
CORS_ORIGINS=https://$DOMAIN,https://admin.$DOMAIN
STORAGE_DRIVER=s3
S3_ENDPOINT=https://placeholder.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=markaradar-media
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_PUBLIC_URL=https://media.$DOMAIN
MAIL_FROM=noreply@$DOMAIN
RESEND_API_KEY=
OPENAI_API_KEY=
SENTRY_DSN=
EOF
  warn "api/.env oluşturuldu — gerçek anahtarları ekle"
fi

# Web .env.local
if [ ! -f web/.env.local ]; then
  cat > web/.env.local <<EOF
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
NEXT_PUBLIC_ENV=production
EOF
fi

# Admin .env.local
if [ ! -f admin/.env.local ]; then
  cat > admin/.env.local <<EOF
NEXT_PUBLIC_API_URL=https://api.$DOMAIN
NEXT_PUBLIC_ADMIN_URL=https://admin.$DOMAIN
NEXT_PUBLIC_WEB_URL=https://$DOMAIN
NEXT_PUBLIC_ENV=production
EOF
fi

# ───────────────────────── 7. Yarn install + build
bold "Bağımlılıklar"
cd "$APP_DIR/api" && yarn install --frozen-lockfile --production=false
yarn prisma generate
yarn prisma db push --skip-generate
ok "API deps + prisma"

# Standalone build artifacts'i kopyalayan helper
copy_standalone_artifacts() {
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  cp -r public .next/standalone/ 2>/dev/null || true
  # middleware varsa standalone'a server manifest'leri de kopyala
  if [ -d .next/server ]; then
    mkdir -p .next/standalone/.next/server
    cp -rn .next/server/* .next/standalone/.next/server/ 2>/dev/null || true
  fi
}

cd "$APP_DIR/web" && yarn install --frozen-lockfile --production=false
NEXT_OUTPUT_STANDALONE=true yarn build
copy_standalone_artifacts
ok "Web build"

cd "$APP_DIR/admin" && yarn install --frozen-lockfile --production=false
NEXT_OUTPUT_STANDALONE=true yarn build
copy_standalone_artifacts
ok "Admin build"

cd "$APP_DIR/api" && yarn build
ok "API build"

# ───────────────────────── 8. PM2
bold "PM2"
mkdir -p /var/log/pm2
cd "$APP_DIR"
pm2 delete markaradar-api markaradar-worker markaradar-web markaradar-admin 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
ok "PM2 servisleri başladı"

# ───────────────────────── 9. Nginx
bold "Nginx"
if ! command -v nginx >/dev/null; then
  apt-get install -y -qq nginx
  systemctl enable --now nginx
fi

if [ ! -L /etc/nginx/sites-enabled/markaradar ]; then
  cp "$APP_DIR/nginx/markaradar.conf" /etc/nginx/sites-available/markaradar

  # Domain custom mı? (markaradar.com değilse)
  if [ "$DOMAIN" != "markaradar.com" ]; then
    # Tüm markaradar.com referanslarını custom domain ile değiştir
    sed -i "s|markaradar\.com|$DOMAIN|g" /etc/nginx/sites-available/markaradar
    ok "Nginx config domain'i ile özelleştirildi: $DOMAIN"
  fi

  # SSL cert henüz yoksa — HTTP-only fallback config (port 80 only)
  if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    # 443 SSL bloklarını yorum satırına al, geçici HTTP-only conf yaz
    cat > /etc/nginx/sites-available/markaradar <<NGINX_HTTP_ONLY
# Geçici HTTP-only (certbot sonrası TLS'li versiyona geçilecek)
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ { root /var/www/certbot; }

    client_max_body_size 25M;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3013;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location / {
        proxy_pass http://127.0.0.1:3013;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
server {
    listen 80;
    listen [::]:80;
    server_name api.$DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    client_max_body_size 25M;
    location / {
        proxy_pass http://127.0.0.1:4010;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
server {
    listen 80;
    listen [::]:80;
    server_name admin.$DOMAIN;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    client_max_body_size 25M;
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3014;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location / {
        proxy_pass http://127.0.0.1:3014;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
NGINX_HTTP_ONLY
    mkdir -p /var/www/certbot
    warn "  HTTP-only nginx config — TLS sonra certbot ile eklenecek"
  fi

  ln -sf /etc/nginx/sites-available/markaradar /etc/nginx/sites-enabled/markaradar
  nginx -t && systemctl reload nginx
  ok "Nginx config linklendi + reload"
else
  ok "Nginx config zaten link'li"
fi

# ───────────────────────── 10. UFW (firewall)
bold "Firewall"
if command -v ufw >/dev/null; then
  ufw allow 22/tcp 2>/dev/null || true
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
  ok "UFW kuralları eklendi (22/80/443)"
fi

# ───────────────────────── 11. Özet
bold "ÖZET"
echo ""
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "<sunucu-ip>")
ok "Kod: $APP_DIR"
ok "API: http://127.0.0.1:4010 (PM2: markaradar-api)"
ok "Web: http://127.0.0.1:3013 (PM2: markaradar-web)"
ok "Admin: http://127.0.0.1:3014 (PM2: markaradar-admin)"
echo ""
ok "Sunucu IP: $SERVER_IP"
echo ""

# Domain sslip.io mı yoksa gerçek mi?
if echo "$DOMAIN" | grep -qE "sslip\.io|nip\.io"; then
  ok "sslip.io domain'i kullanılıyor — DNS otomatik çözümlenir"
  echo ""
  ok "Şimdi tarayıcıdan aç:"
  echo "  http://$DOMAIN              → web"
  echo "  http://api.$DOMAIN          → API"
  echo "  http://admin.$DOMAIN        → admin"
  echo ""
  warn "Sonraki adımlar:"
  echo ""
  echo "  1) TLS al (HTTPS):"
  echo "     sudo apt install -y certbot python3-certbot-nginx"
  echo "     sudo certbot --nginx -d $DOMAIN -d api.$DOMAIN -d admin.$DOMAIN"
  echo ""
  echo "  2) Gerçek API anahtarları:"
  echo "     nano $APP_DIR/api/.env"
  echo "     pm2 restart all"
else
  warn "Sonraki adımlar:"
  echo ""
  echo "  1) DNS Cloudflare panelinde:"
  echo "     $DOMAIN              A  $SERVER_IP"
  echo "     www.$DOMAIN          A  $SERVER_IP"
  echo "     api.$DOMAIN          A  $SERVER_IP"
  echo "     admin.$DOMAIN        A  $SERVER_IP"
  echo "     (Cloudflare proxy DNS-only — certbot için)"
  echo ""
  echo "  2) TLS (DNS aktif olunca, ~5dk sonra):"
  echo "     sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -d admin.$DOMAIN"
  echo ""
  echo "  3) Anahtarları doldur:"
  echo "     nano $APP_DIR/api/.env"
  echo "     pm2 restart all"
fi
echo ""
echo "  Demo verisi (opsiyonel):"
echo "     cd $APP_DIR/api && yarn prisma db seed"
echo ""
echo "  PM2:"
echo "     pm2 list"
echo "     pm2 logs markaradar-api"
echo ""
ok "Kurulum tamam ✓"
