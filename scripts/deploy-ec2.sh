#!/bin/bash

set -e

echo "🚀 Starting deployment process..."

# 변수 설정
ECR_IMAGE="${1:-127994096408.dkr.ecr.ap-northeast-2.amazonaws.com/helloc:latest}"
COMPOSE_FILE="docker-compose.production.yml"
PROJECT_DIR="/home/ubuntu/robovers-server"

# 프로젝트 디렉토리로 이동
cd $PROJECT_DIR

echo "📦 Pulling latest image: $ECR_IMAGE"
docker pull $ECR_IMAGE

# 환경 변수 설정
export ECR_REPOSITORY=$ECR_IMAGE

echo "🔄 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

echo "🚀 Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "📊 Checking container status..."
docker-compose -f $COMPOSE_FILE ps

echo "📋 Showing logs..."
docker-compose -f $COMPOSE_FILE logs --tail=50

echo "✅ Deployment completed successfully!"

# 헬스체크 대기
echo "⏳ Waiting for health checks..."
sleep 30

# 서비스 상태 확인
if docker-compose -f $COMPOSE_FILE ps | grep -q "healthy"; then
    echo "✅ All services are healthy!"
else
    echo "⚠️  Warning: Some services may not be healthy yet"
    docker-compose -f $COMPOSE_FILE ps
fi