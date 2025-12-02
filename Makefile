.PHONY: dev dev-frontend dev-backend install install-frontend install-backend build clean

# Development
dev:
	@echo "Starting ClaudeScope development servers..."
	@make -j2 dev-frontend dev-backend

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 6000

# Installation
install: install-backend install-frontend
	@echo "All dependencies installed!"

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && pip install -r requirements.txt

# Build
build:
	cd frontend && npm run build

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

# Clean
clean:
	rm -rf frontend/.next frontend/node_modules
	rm -rf backend/__pycache__ backend/app/__pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

# Help
help:
	@echo "ClaudeScope - Claude Code Usage Analyzer"
	@echo ""
	@echo "Commands:"
	@echo "  make dev            - Start both frontend and backend in dev mode"
	@echo "  make dev-frontend   - Start frontend only"
	@echo "  make dev-backend    - Start backend only"
	@echo "  make install        - Install all dependencies"
	@echo "  make build          - Build frontend for production"
	@echo "  make docker-up      - Start with Docker Compose"
	@echo "  make clean          - Clean build artifacts"
