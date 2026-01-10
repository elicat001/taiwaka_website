.PHONY: all build run dev test clean deps fmt lint docker-build docker-run

# 变量
APP_NAME := taiwaka-coffee-api
MAIN_PATH := ./cmd/server
BUILD_DIR := ./bin
GO := go

# 默认目标
all: deps build

# 安装依赖
deps:
	$(GO) mod download
	$(GO) mod tidy

# 构建应用
build:
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 $(GO) build -ldflags="-w -s" -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(APP_NAME)"

# 开发模式运行
dev:
	$(GO) run $(MAIN_PATH)

# 生产模式运行
run: build
	$(BUILD_DIR)/$(APP_NAME)

# 运行测试
test:
	$(GO) test -v ./...

# 运行测试并生成覆盖率报告
test-coverage:
	$(GO) test -v -coverprofile=coverage.out ./...
	$(GO) tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# 清理构建文件
clean:
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

# 格式化代码
fmt:
	$(GO) fmt ./...

# 代码检查
lint:
	@which golangci-lint > /dev/null || (echo "Installing golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run

# Docker 构建
docker-build:
	docker build -t $(APP_NAME):latest .

# Docker 运行
docker-run:
	docker run -p 3000:3000 --env-file ../.env $(APP_NAME):latest

# 数据库迁移 (需要配置环境变量)
migrate:
	@echo "Running database migrations..."
	$(GO) run $(MAIN_PATH) migrate

# 生成 API 文档
docs:
	@which swag > /dev/null || (echo "Installing swag..." && go install github.com/swaggo/swag/cmd/swag@latest)
	swag init -g $(MAIN_PATH)/main.go -o ./docs

# 帮助
help:
	@echo "Available commands:"
	@echo "  make deps          - Download dependencies"
	@echo "  make build         - Build the application"
	@echo "  make dev           - Run in development mode"
	@echo "  make run           - Build and run"
	@echo "  make test          - Run tests"
	@echo "  make test-coverage - Run tests with coverage"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make fmt           - Format code"
	@echo "  make lint          - Run linter"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-run    - Run Docker container"
