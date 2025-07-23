FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY apps/user apps/user
COPY libs libs

# Prisma 클라이언트 생성
RUN npx prisma generate --schema=apps/user/prisma/schema.prisma

# 빌드
RUN npm run build user

# 프로덕션 스테이지
FROM node:22-alpine

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 빌드된 애플리케이션 복사
COPY --from=builder /app/dist/apps/user ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/user/prisma ./prisma

# 포트 노출
EXPOSE 4001

# 애플리케이션 실행
CMD ["node", "dist/main"]