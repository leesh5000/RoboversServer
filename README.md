# Robovers Server

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/leesh5000/RoboversServer?utm_source=oss&utm_medium=github&utm_campaign=leesh5000%2FRoboversServer&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

> AI와 인간이 협업하여 만드는 신뢰할 수 있는 기술 지식 플랫폼 서버

## 🚀 프로젝트 개요

Robovers Server는 AI가 생성한 기술 콘텐츠를 크라우드소싱을 통해 검증하고 개선하는 혁신적인 플랫폼의 백엔드 서버입니다. 기여자들에게 경제적 보상을 제공하여 지속가능한 생태계를 구축하고, 고품질의 기술 문서를 무료로 제공합니다.

### 🎯 핵심 가치

- **정확성**: 커뮤니티 검증을 통한 신뢰할 수 있는 콘텐츠
- **보상**: 기여에 대한 공정한 경제적 보상
- **접근성**: 누구나 무료로 양질의 기술 문서 열람 가능
- **투명성**: 모든 편집 이력과 기여도 공개

## 🏗️ 기술 스택

### Backend
- **Framework**: NestJS
- **Language**: TypeScript (Node.js 22+)
- **Database**: MySQL 8.0+ with Prisma ORM
- **Cache**: Redis (ioredis)
- **Authentication**: JWT (Passport.js)
- **Email**: Nodemailer
- **ID Generation**: Snowflake ID

## 📚 프로젝트 구조

```
RoboversServer/
├── libs/
│   └── common/
│       └── snowflake/    # Snowflake ID 생성기
├── apps/
│   └── user/            # 사용자 서비스
│       ├── src/
│       │   ├── domain/      # 도메인 모델
│       │   ├── application/ # 유즈케이스
│       │   ├── infrastructure/ # DB, 메일 등
│       │   └── interfaces/   # 컨트롤러
│       └── test/
├── prisma/
│   └── schema.prisma    # Prisma 스키마 정의
└── package.json
```

## 🚦 Installation

```bash
$ npm install
```

## 🏃 Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🧪 Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 📚 API Documentation

API 문서는 서버 실행 후 `/api/docs`에서 확인할 수 있습니다.

## 🔧 Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="mysql://user:password@localhost:3306/robovers"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Snowflake
SNOWFLAKE_NODE_ID=1
```

## 📄 License

This project is MIT licensed.