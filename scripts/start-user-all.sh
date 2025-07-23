#!/bin/bash

# User 서비스 전체 실행 스크립트 (Docker + 애플리케이션)

echo "🚀 Starting User Service Infrastructure..."

# 1. Docker 인프라 실행 (PostgreSQL + Redis)
echo "📦 Starting Docker containers..."
docker-compose -p robovers-user -f apps/user/docker/docker-compose-infra.yml up -d

# 2. 컨테이너가 준비될 때까지 대기
echo "⏳ Waiting for services to be ready..."
sleep 5

# PostgreSQL 준비 확인
echo "🔍 Checking PostgreSQL..."
until docker exec db pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Redis 준비 확인
echo "🔍 Checking Redis..."
until docker exec redis redis-cli -a userServiceRedisPassword ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready!"

# 3. 데이터베이스 마이그레이션 실행
echo "🗄️  Running database migrations..."
DATABASE_URL="postgresql://postgres:password@localhost:25432/robovers_user" npx prisma migrate deploy --schema=apps/user/prisma/schema.prisma

# 4. 환경 변수 설정
export DATABASE_URL="postgresql://postgres:password@localhost:25432/robovers_user"
export REDIS_HOST=localhost
export REDIS_PORT=26379
export REDIS_PASSWORD=userServiceRedisPassword
export JWT_SECRET=user-service-secret-key-change-this-in-production
export JWT_EXPIRATION=7d
export PORT=5000

# 5. User 서비스 실행
echo "🚀 Starting User Service application..."
echo "📍 Service will be available at: http://localhost:5000"
echo "📚 API documentation: http://localhost:5000/api/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# 종료 시 Docker 컨테이너도 정리
trap 'echo "🛑 Stopping services..."; docker-compose -p robovers-user -f apps/user/docker/docker-compose-infra.yml down; exit' INT TERM

# 애플리케이션 실행
npm run start:dev:user