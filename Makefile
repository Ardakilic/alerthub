# Makefile for AlertHub
# All commands run in Docker to ensure consistent environment

# Variables
DOCKER_IMAGE = node:22
DOCKER_RUN = docker run --rm -v "$(shell pwd)":/app -w /app -e NODE_OPTIONS="--experimental-vm-modules" $(DOCKER_IMAGE)

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make test          - Run all tests"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make test-coverage - Run tests with coverage report"
	@echo "  make lint          - Run linter"
	@echo "  make lint-fix      - Run linter with auto-fix"
	@echo "  make start         - Start the application"
	@echo "  make init          - Initialize environment (copy .env.example to .env)"
	@echo "  make install       - Install dependencies"
	@echo "  make clean         - Clean node_modules and coverage"
	@echo "  make shell         - Open interactive shell in container"

# Test commands
.PHONY: test
test:
	$(DOCKER_RUN) npm run test

.PHONY: test-watch
test-watch:
	$(DOCKER_RUN) npm run test:watch

.PHONY: test-coverage
test-coverage:
	$(DOCKER_RUN) npm run test:coverage

# Lint commands
.PHONY: lint
lint:
	$(DOCKER_RUN) npm run lint

.PHONY: lint-fix
lint-fix:
	$(DOCKER_RUN) npm run lint:fix

# Application commands
.PHONY: start
start:
	$(DOCKER_RUN) npm start

.PHONY: init
init:
	$(DOCKER_RUN) npm run init

# Development commands
.PHONY: install
install:
	$(DOCKER_RUN) npm install

.PHONY: clean
clean:
	$(DOCKER_RUN) rm -rf node_modules coverage

.PHONY: shell
shell:
	docker run --rm -it -v "$(shell pwd)":/app -w /app -e NODE_OPTIONS="--experimental-vm-modules" $(DOCKER_IMAGE) /bin/bash

# CI/CD helpers
.PHONY: ci-test
ci-test:
	$(DOCKER_RUN) npm run test:coverage
	@echo "Coverage report generated in ./coverage/"

.PHONY: ci-lint
ci-lint:
	$(DOCKER_RUN) npm run lint

# Combined commands
.PHONY: check
check: lint test

.PHONY: check-all
check-all: lint test-coverage

# Docker image management
.PHONY: pull
pull:
	docker pull $(DOCKER_IMAGE)

.PHONY: docker-info
docker-info:
	@echo "Docker image: $(DOCKER_IMAGE)"
	@echo "Docker run command: $(DOCKER_RUN)"
