# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

### 개발 환경 실행
```bash
# Docker로 데이터베이스 및 Redis 시작 + 개발 서버 실행
./scripts/start-dev.sh

# 개발 서버만 실행 (데이터베이스가 이미 실행 중일 때)
npm run start:dev

# 디버그 모드로 실행
npm run start:debug
```

### 테스트 실행
```bash
# 단위 테스트
npm run test

# 특정 파일 테스트
npm run test <파일경로>

# 테스트 감시 모드
npm run test:watch

# E2E 테스트
npm run test:e2e

# 테스트 커버리지 확인
npm run test:cov
```

### 코드 품질 관리
```bash
# ESLint 실행 (자동 수정 포함)
npm run lint

# Prettier 포맷팅
npm run format
```

### 빌드
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start:prod
```

### 데이터베이스 관리
```bash
# Prisma 마이그레이션 생성
npx prisma migrate dev --name <migration-name>

# Prisma 스키마 동기화
npx prisma generate

# 데이터베이스 초기화
./scripts/init-db.sh
```

## 환경 설정

`.env` 파일이 없을 경우 `.env.example`을 복사하여 생성합니다:
```bash
cp .env.example .env
```

필수 환경 변수:
- `DATABASE_URL`: MySQL 연결 문자열
- `REDIS_HOST`, `REDIS_PORT`: Redis 연결 정보
- `JWT_SECRET`: JWT 토큰 서명 키
- `SMTP_*`: 이메일 전송 설정

## 아키텍처 개요

이 프로젝트는 **Domain-Driven Design (DDD)** 및 **Clean Architecture** 원칙을 따릅니다.

### 계층 구조

1. **Domain Layer** (`domain/`)
   - 비즈니스 로직의 핵심
   - 엔티티, 값 객체, 도메인 서비스
   - 외부 의존성 없음
   - 예: `User`, `UserEmail`, `VerificationCode`

2. **Application Layer** (`application/`)
   - 유즈케이스 구현
   - 도메인 로직 오케스트레이션
   - 포트 인터페이스 정의
   - 제어 구조(`if`, `for`) 사용 금지 - 도메인 서비스에 위임
   - 예: `UserSignUpUseCase`, `UserLoginUseCase`

3. **Infrastructure Layer** (`infrastructure/`)
   - 기술적 구현체
   - 리포지토리 구현 (Prisma)
   - 외부 서비스 연동 (Redis, Email)
   - 예: `PrismaUserRepository`, `RedisVerificationCodeRepository`

4. **Interfaces Layer** (`interfaces/`)
   - REST API 컨트롤러
   - DTO 정의
   - 인증 가드 및 전략
   - 예: `AuthController`, `SignUpDto`

### 주요 패턴

- **Repository Pattern**: 데이터 접근 추상화
- **Port & Adapter**: 인터페이스를 통한 의존성 역전
- **Value Object**: 불변 객체로 도메인 개념 표현
- **Use Case**: 단일 비즈니스 기능 캡슐화

### ID 생성

Snowflake ID를 사용하여 분산 환경에서 고유 ID 생성:
```typescript
const snowflakeGenerator = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);
const id = snowflakeGenerator.generate(); // bigint 타입
```

### 의존성 주입

NestJS의 DI 컨테이너를 활용하여 인터페이스 기반 주입:
```typescript
@Inject('UserRepository') private readonly userRepository: UserRepository
```

모든 구현체는 모듈에서 Provider로 등록됩니다.

### 인증 코드 관리

`VerificationCode`는 Redis를 통해 관리되며, 다음 기능을 제공합니다:
- **TTL 기반 자동 만료**: 5분 후 자동 삭제
- **인증 시도 횟수 제한**: 사용자당 최대 5회 시도 (1시간 TTL)
- **이메일 발송 제한**: 이메일당 분당 1회 발송 제한
- **인메모리 저장**: 임시 데이터의 빠른 조회 및 자동 정리

**주의**: `VerificationCode`는 데이터베이스가 아닌 Redis에만 저장됩니다.

## 프로젝트 구조

```
RoboversServer/
├── libs/common/snowflake/     # Snowflake ID 생성기 라이브러리
├── apps/user/                 # 사용자 서비스 모듈
│   ├── src/
│   │   ├── domain/           # 도메인 모델 및 비즈니스 로직
│   │   ├── application/      # 유즈케이스 및 포트 정의
│   │   ├── infrastructure/   # 외부 시스템 연동 구현체
│   │   └── interfaces/       # REST API 및 DTO
│   └── test/                 # 테스트 파일
├── prisma/schema.prisma      # Prisma 데이터베이스 스키마
└── scripts/                  # 개발 및 배포 스크립트