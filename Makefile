.PHONY: help up down restart logs ps psql redis-cli minio mail \
        api web admin install migrate seed studio reset \
        build clean

help:
	@echo "MarkaRadar — kısayollar"
	@echo ""
	@echo "Docker:"
	@echo "  make up           # docker servislerini başlat"
	@echo "  make down         # durdur (data korunur)"
	@echo "  make reset        # data dahil sil + baştan başlat"
	@echo "  make logs         # docker logs (tail -f)"
	@echo "  make ps           # durum"
	@echo "  make psql         # postgres'e bağlan"
	@echo "  make redis-cli    # redis'e bağlan"
	@echo "  make minio        # minio console aç (browser)"
	@echo "  make mail         # mailhog UI aç (browser)"
	@echo ""
	@echo "API:"
	@echo "  make api          # api'yi dev modda başlat"
	@echo "  make migrate      # prisma migrate dev"
	@echo "  make seed         # prisma seed"
	@echo "  make studio       # prisma studio aç"
	@echo ""
	@echo "Web/Admin:"
	@echo "  make web          # web'i dev modda başlat (port 3003)"
	@echo "  make admin        # admin'i dev modda başlat (port 3004)"
	@echo ""
	@echo "Toplu:"
	@echo "  make install      # üç projeye de yarn install"
	@echo "  make build        # üçünü de production build"
	@echo "  make clean        # node_modules + build sil"

# ─── Docker ─────────────────────────────────────────
up:
	docker compose up -d
	@echo "✓ Postgres :5434  Redis :6390  MinIO :9110  MailHog :8030"

down:
	docker compose stop

reset:
	docker compose down -v
	docker compose up -d

logs:
	docker compose logs -f --tail=50

ps:
	docker compose ps

psql:
	docker exec -it markaradar_postgres psql -U markaradar -d markaradar_dev

redis-cli:
	docker exec -it markaradar_redis redis-cli

minio:
	open http://localhost:9111

mail:
	open http://localhost:8030

# ─── API ────────────────────────────────────────────
api:
	cd api && yarn start:dev

worker:
	cd api && yarn start:worker:dev

migrate:
	cd api && yarn prisma migrate dev

seed:
	cd api && yarn prisma db seed

studio:
	cd api && yarn prisma studio

# ─── Frontend ───────────────────────────────────────
web:
	cd web && yarn dev

admin:
	cd admin && yarn dev

# ─── Toplu ──────────────────────────────────────────
install:
	cd api && yarn install
	cd web && yarn install
	cd admin && yarn install

build:
	cd api && yarn build
	cd web && yarn build
	cd admin && yarn build

clean:
	rm -rf api/node_modules api/dist
	rm -rf web/node_modules web/.next
	rm -rf admin/node_modules admin/.next
