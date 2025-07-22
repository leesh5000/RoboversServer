#!/bin/bash

echo "🚀 Starting development environment..."

# Docker Compose로 데이터베이스 시작
echo "🐳 Starting Docker containers..."
docker-compose up -d

# 데이터베이스가 준비될 때까지 대기
echo "⏳ Waiting for database to be ready..."
sleep 5

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
fi

# 데이터베이스 초기화
echo "📦 Initializing database..."
./scripts/init-db.sh

# 개발 서버 시작
echo "🔥 Starting NestJS development server..."
npm run start:dev