#!/bin/bash

# User 서비스 상태 확인 스크립트

echo "📊 User Service Status"
echo "====================="

# Docker 컨테이너 상태
echo ""
echo "🐳 Docker Containers:"
docker-compose -p robovers-user -f apps/user/docker/docker-compose-infra.yml ps

# Node 프로세스 상태
echo ""
echo "🟢 Node.js Process:"
if pgrep -f "nest start user" > /dev/null; then
    echo "   ✅ User Service is running on port 5000"
    echo "   📍 API: http://localhost:5000"
    echo "   📚 Docs: http://localhost:5000/api/docs"
else
    echo "   ❌ User Service is not running"
fi

# 포트 사용 확인
echo ""
echo "🔌 Port Usage:"
echo "   PostgreSQL (25432):" $(lsof -i:25432 > /dev/null 2>&1 && echo "✅ In use" || echo "❌ Not in use")
echo "   Redis (26379):" $(lsof -i:26379 > /dev/null 2>&1 && echo "✅ In use" || echo "❌ Not in use")
echo "   User Service (5000):" $(lsof -i:5000 > /dev/null 2>&1 && echo "✅ In use" || echo "❌ Not in use")