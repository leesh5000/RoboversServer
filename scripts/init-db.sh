#!/bin/bash

echo "🚀 Initializing database..."

# Prisma 마이그레이션 실행
echo "📦 Running Prisma migrations..."
npx prisma migrate dev --name init

# Prisma 클라이언트 생성
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Database initialization complete!"