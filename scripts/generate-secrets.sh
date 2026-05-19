#!/bin/sh
# ═══════════════════════════════════════════════════════════════
# Production secret generator
# Kullanım:  ./scripts/generate-secrets.sh > .env.prod.secrets
# Sonra .env.prod'a bu değerleri kopyala (üzerine yaz).
# ═══════════════════════════════════════════════════════════════

gen() {
  openssl rand -base64 "$1" | tr -d '\n' | tr '/+' '_-'
}

echo "# ═══════════════════════════════════════════════════════════"
echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "# ═══════════════════════════════════════════════════════════"
echo ""
echo "# Postgres"
echo "POSTGRES_PASSWORD=$(gen 32)"
echo ""
echo "# Redis"
echo "REDIS_PASSWORD=$(gen 32)"
echo ""
echo "# JWT"
echo "JWT_SECRET=$(gen 48)"
echo "JWT_REFRESH_SECRET=$(gen 48)"
echo ""
echo "# Cookie sign"
echo "COOKIE_SECRET=$(gen 32)"
echo ""
echo "# ⚠️  Yukarıdaki değerleri sadece SEN gör. Asla commit etme."
echo "# .env.prod'a kopyala ve .env.prod'u .gitignore'da olduğunu doğrula."
