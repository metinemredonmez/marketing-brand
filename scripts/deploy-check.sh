#!/bin/sh
# ═══════════════════════════════════════════════════════════════
# Pre-deploy sanity check
# Kullanım:  ./scripts/deploy-check.sh [path/to/.env.prod]
# ═══════════════════════════════════════════════════════════════

set -eu

ENV_FILE="${1:-.env.prod}"
ERRORS=0
WARNINGS=0

red() { printf "\033[0;31m%s\033[0m\n" "$1"; }
yellow() { printf "\033[0;33m%s\033[0m\n" "$1"; }
green() { printf "\033[0;32m%s\033[0m\n" "$1"; }
bold() { printf "\033[1m%s\033[0m\n" "$1"; }

require() {
  local key="$1"
  local value
  value=$(grep -E "^${key}=" "${ENV_FILE}" | head -1 | cut -d= -f2-)
  if [ -z "${value}" ]; then
    red "  ✗ ${key} eksik"
    ERRORS=$((ERRORS + 1))
  else
    green "  ✓ ${key}"
  fi
}

optional() {
  local key="$1"
  local value
  value=$(grep -E "^${key}=" "${ENV_FILE}" | head -1 | cut -d= -f2-)
  if [ -z "${value}" ]; then
    yellow "  ⚠ ${key} boş (opsiyonel)"
    WARNINGS=$((WARNINGS + 1))
  else
    green "  ✓ ${key}"
  fi
}

if [ ! -f "${ENV_FILE}" ]; then
  red "✗ ${ENV_FILE} bulunamadı"
  exit 1
fi

bold "═══ Domain & URL'ler"
require "WEB_DOMAIN"
require "API_DOMAIN"
require "ADMIN_DOMAIN"

bold ""
bold "═══ Veritabanı & Cache (KRİTİK)"
require "POSTGRES_PASSWORD"
require "REDIS_PASSWORD"

bold ""
bold "═══ Auth secrets (KRİTİK)"
require "JWT_SECRET"
require "JWT_REFRESH_SECRET"

# JWT secret uzunluğu kontrol
jwt_len=$(grep "^JWT_SECRET=" "${ENV_FILE}" | cut -d= -f2- | wc -c | tr -d ' ')
if [ "${jwt_len}" -lt 32 ]; then
  red "  ✗ JWT_SECRET < 32 char (env.validation reddedecek)"
  ERRORS=$((ERRORS + 1))
fi

bold ""
bold "═══ Üçüncü taraf (Production için gerekli)"
require "STRIPE_SECRET_KEY"
require "STRIPE_WEBHOOK_SECRET"
require "RESEND_API_KEY"
require "OPENAI_API_KEY"

bold ""
bold "═══ Medya & Backup (önerilen)"
optional "R2_ACCOUNT_ID"
optional "R2_ACCESS_KEY_ID"
optional "R2_SECRET_ACCESS_KEY"
optional "R2_BUCKET"

bold ""
bold "═══ TR ödeme (opsiyonel)"
optional "IYZICO_API_KEY"
optional "IYZICO_SECRET_KEY"

bold ""
bold "═══ Monitoring (önerilen)"
optional "SENTRY_DSN"
optional "NEXT_PUBLIC_WEB_SENTRY_DSN"
optional "NEXT_PUBLIC_ADMIN_SENTRY_DSN"

bold ""
bold "═══ Analytics (opsiyonel)"
optional "PLAUSIBLE_DOMAIN"
optional "POSTHOG_KEY"

bold ""
bold "═══ Sonuç"
if [ "${ERRORS}" -eq 0 ]; then
  green "✓ Hiç kritik eksik yok"
else
  red "✗ ${ERRORS} kritik eksiklik var — deploy edilemez"
fi
if [ "${WARNINGS}" -gt 0 ]; then
  yellow "⚠ ${WARNINGS} opsiyonel eksiklik (deploy edilebilir, ama özellikler eksik kalır)"
fi

# .gitignore kontrolü — secret file commit'lenmemiş mi?
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if ! grep -q "^\.env\.prod$\|^\.env\.prod\.local$" .gitignore 2>/dev/null; then
    yellow "⚠ .gitignore'da .env.prod yok — secret leak riski"
  fi
fi

exit "${ERRORS}"
