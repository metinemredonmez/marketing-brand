#!/bin/sh
# ═══════════════════════════════════════════════════════════════
# Postgres backup → R2 (Cloudflare)
# Cron: günde 1 kez (03:00)
# Retention: ${BACKUP_RETENTION_DAYS} gün (default 14)
# ═══════════════════════════════════════════════════════════════

set -eu

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_FILE="${BACKUP_DIR}/markaradar_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

# ── 1. pg_dump + gzip
echo "[backup] dump başlıyor → ${BACKUP_FILE}"
pg_dump \
  --host=postgres \
  --username="${POSTGRES_USER}" \
  --dbname="${POSTGRES_DB}" \
  --no-owner --no-privileges --clean --if-exists \
  | gzip -9 > "${BACKUP_FILE}"

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[backup] ✓ dump tamam (${SIZE})"

# ── 2. R2'ye upload (eğer env varsa)
if [ -n "${BACKUP_R2_BUCKET:-}" ] && [ -n "${BACKUP_R2_ENDPOINT:-}" ]; then
  echo "[backup] R2'ye yükleniyor..."
  aws s3 cp "${BACKUP_FILE}" "s3://${BACKUP_R2_BUCKET}/$(basename "${BACKUP_FILE}")" \
    --endpoint-url "${BACKUP_R2_ENDPOINT}" \
    --no-progress
  echo "[backup] ✓ R2 upload tamam"
fi

# ── 3. Eski yedekleri sil (retention)
echo "[backup] ${RETENTION_DAYS} günden eski dosyalar siliniyor..."
find "${BACKUP_DIR}" -name "markaradar_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
COUNT=$(find "${BACKUP_DIR}" -name "markaradar_*.sql.gz" | wc -l | tr -d ' ')
echo "[backup] ✓ ${COUNT} lokal yedek kaldı"

echo "[backup] ═════ ${TIMESTAMP} tamamlandı"
