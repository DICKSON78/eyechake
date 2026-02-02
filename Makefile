.PHONY: help build up down restart logs shell clean install migrate fresh test

# Default target
help:
	@echo "Eyechake Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make build       - Build all Docker images"
	@echo "  make up          - Start all containers"
	@echo "  make down        - Stop all containers"
	@echo "  make restart     - Restart all containers"
	@echo "  make logs        - View logs from all containers"
	@echo "  make shell       - Access app container shell"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make install     - Install/update dependencies"
	@echo "  make migrate     - Run database migrations"
	@echo "  make fresh       - Fresh install (reset database)"
	@echo "  make test        - Run tests"
	@echo "  make frontend    - Build frontend assets"
	@echo "  make dev         - Start development environment"
	@echo "  make health      - Check service health"

# Build Docker images
build:
	docker-compose build --no-cache

# Start containers
up:
	docker-compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@make health

# Stop containers
down:
	docker-compose down

# Restart containers
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Access app shell
shell:
	docker-compose exec app bash

# Clean everything
clean:
	docker-compose down -v
	docker system prune -f

# Install dependencies
install:
	docker-compose exec app composer install --optimize-autoloader
	docker-compose exec app npm ci --legacy-peer-deps

# Run migrations
migrate:
	docker-compose exec app php artisan migrate --force

# Fresh installation
fresh:
	docker-compose exec app php artisan migrate:fresh --seed --force

# Run tests
test:
	docker-compose exec app php artisan test

# Build frontend assets
frontend:
	docker-compose --profile build up frontend
	docker-compose --profile build down

# Start development environment with hot reload
dev:
	docker-compose --profile development up -d

# Check health of services
health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@docker-compose exec app php artisan --version || echo "App: Not Ready"
	@docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword || echo "DB: Not Ready"
	@docker-compose exec redis redis-cli ping || echo "Redis: Not Ready"
