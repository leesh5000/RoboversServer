# CI/CD 파이프라인 설정 가이드

## 개요

이 문서는 RoboversServer 프로젝트의 AWS ECR/EC2 기반 CI/CD 파이프라인 설정 방법을 설명합니다.

## 구성 요소

1. **GitHub Actions**: 자동 빌드, 테스트, 배포
2. **AWS ECR**: Docker 이미지 저장소
3. **AWS EC2**: 애플리케이션 호스팅
4. **Docker Compose**: 프로덕션 환경 구성

## 설정 단계

### 1. GitHub Secrets 설정

GitHub 리포지토리의 Settings > Secrets and variables > Actions에서 다음 시크릿을 추가합니다:

- `AWS_ACCESS_KEY_ID`: AWS IAM 사용자의 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS IAM 사용자의 시크릿 액세스 키
- `EC2_HOST`: EC2 인스턴스의 퍼블릭 IP 또는 도메인
- `EC2_USERNAME`: EC2 SSH 사용자명 (보통 `ubuntu`)
- `EC2_SSH_KEY`: EC2 인스턴스에 접속할 SSH 프라이빗 키 (전체 내용)

### 2. AWS IAM 권한 설정

CI/CD용 IAM 사용자에게 다음 권한이 필요합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. EC2 초기 설정

EC2 인스턴스에 SSH로 접속하여 다음 명령을 실행합니다:

```bash
# 옵션 1: Public 저장소인 경우
# [your-username]/[your-repo]를 실제 GitHub 사용자명과 저장소명으로 교체하세요
# 예: leesh5000/RoboversServer
curl -o setup-ec2.sh https://raw.githubusercontent.com/[your-username]/[your-repo]/main/scripts/setup-ec2.sh

# 옵션 2: Private 저장소인 경우
# GitHub Personal Access Token이 필요합니다
# GitHub Settings > Developer settings > Personal access tokens에서 생성
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
     -o setup-ec2.sh \
     https://raw.githubusercontent.com/[your-username]/[your-repo]/main/scripts/setup-ec2.sh

# 또는 Private 저장소의 경우 먼저 저장소를 클론한 후 스크립트 실행
git clone https://github.com/[your-username]/[your-repo].git
cd [your-repo]
cp scripts/setup-ec2.sh ~/
cd ~

# 스크립트 실행 권한 부여
chmod +x setup-ec2.sh

# 스크립트 실행 (반드시 ./ 를 붙여야 함)
./setup-ec2.sh
```

### 4. GitHub Secrets 설정

GitHub 리포지토리 설정에서 다음 Secrets를 추가합니다:

#### 필수 Secrets:
- `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키
- `AWS_ECR_REPOSITORY`: ECR 리포지토리 URL (예: `123456789.dkr.ecr.ap-northeast-2.amazonaws.com/robovers`)
- `EC2_HOST`: EC2 인스턴스의 Public IP 또는 도메인
- `EC2_USERNAME`: EC2 사용자명 (보통 `ubuntu`)
- `EC2_SSH_KEY`: EC2 접속용 SSH 프라이빗 키
- `ENV_PRODUCTION`: 프로덕션 환경 변수 (아래 형식 참조)

#### ENV_PRODUCTION 형식:
```env
NODE_ENV=production
PORT=4001

# Database
DB_PASSWORD=your-secure-password-here

# Redis
REDIS_PASSWORD=your-secure-redis-password-here

# JWT
JWT_SECRET=your-secure-jwt-secret-here
JWT_EXPIRATION=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="Robovers <noreply@robovers.com>"

# Snowflake
SNOWFLAKE_NODE_ID=1

# CORS
CORS_ORIGIN=https://your-domain.com
```

> **자동화 완료!** 이제 main 브랜치에 push하면:
> - 자동으로 최신 코드가 EC2에 배포됩니다
> - 환경 변수가 자동으로 설정됩니다
> - Docker가 설치되어 있지 않으면 자동으로 설치됩니다
> - 수동 작업이 전혀 필요하지 않습니다

### 5. 초기 EC2 설정 (한 번만 수행)

EC2 인스턴스에 처음 접속하여 기본 설정만 수행합니다:

```bash
# SSH로 EC2 접속
ssh ubuntu@[EC2_HOST]

# Git 설치 (이미 설치되어 있을 수 있음)
sudo apt-get update
sudo apt-get install -y git
```

> **참고**: 이후 모든 파일과 설정은 GitHub Actions가 자동으로 처리합니다!

## 배포 프로세스

1. `main` 브랜치에 코드 푸시 또는 PR 머지
2. GitHub Actions가 자동으로 실행:
   - 코드 체크아웃
   - 의존성 설치 및 테스트 실행
   - Docker 이미지 빌드
   - AWS ECR에 이미지 푸시
   - EC2에 SSH 접속하여 배포 스크립트 실행
3. EC2에서 새 이미지로 컨테이너 재시작

## 수동 배포

필요시 EC2에서 직접 배포할 수 있습니다:

```bash
cd /home/ubuntu/robovers-server
./scripts/deploy-ec2.sh
```

## 모니터링

### 컨테이너 상태 확인
```bash
docker-compose -f docker-compose.production.yml ps
```

### 로그 확인
```bash
docker-compose -f docker-compose.production.yml logs -f user-service
```

### 헬스체크
```bash
curl http://localhost:4001/health
```

## 문제 해결

### ECR 로그인 실패
```bash
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 127994096408.dkr.ecr.ap-northeast-2.amazonaws.com
```

### 컨테이너 재시작
```bash
docker-compose -f docker-compose.production.yml restart user-service
```

### 전체 재배포
```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```