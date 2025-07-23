#!/bin/bash

# User 서비스 전체 중지 스크립트

echo "🛑 Stopping User Service..."

# Node 프로세스 종료
echo "📍 Stopping Node.js application..."
pkill -f "nest start user" || echo "   No running application found"

# Docker 컨테이너 중지
echo "📦 Stopping Docker containers..."
docker-compose -p robovers-user -f apps/user/docker/docker-compose-infra.yml down

echo "✅ All services stopped!"