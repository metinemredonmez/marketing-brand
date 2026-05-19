#!/bin/sh
# ═══════════════════════════════════════════════════════════════
# Postgres restore — son backup'tan veya belirli bir dosyadan
#
# Kullanım:
#   docker compose -f docker-compose.prod.yml exec backup \
#     /usr/local/bin/restore.sh [BACKUP_FILE]
#
# BACKUP_FILE verilmezse en son tarihli yedek kullanılır.
# ═══════════════════════════════════════════════════════════════

set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_FILE="${1:-}"

# En son yedek
if [ -z "${BACKUP_FILE}" ]; then
  BACKUP_FILE=$(ls -1t "${BACKUP_DIR}"/markaradar_*.sql.gz 2>/dev/null | head -n 1 || true)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "✗ Backup dosyası bulunamadı: ${BACKUP_FILE:-<son yedek yok>}"
  exit 1
fi

echo "[restore] Kaynak: ${BACKUP_FILE}"
echo "[restore] Hedef: postgres / ${POSTGRES_DB}"
echo ""
echo "⚠️  Bu işlem MEVCUT veritabanını ÜZERİNE YAZACAK."
printf "Devam? [y/N] "
read -r CONFIRM
if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
  echo "İptal edildi."
  exit 0
fi

gunzip -c "${BACKUP_FILE}" | psql \
  --host=postgres \
  --username="${POSTGRES_USER}" \
  --dbname="${POSTGRES_DB}"

echo "[restore] ✓ Tamamlandı"
