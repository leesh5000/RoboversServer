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
# 설정 스크립트 다운로드 및 실행
curl -o setup-ec2.sh https://raw.githubusercontent.com/[your-repo]/main/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 4. 환경 변수 설정

EC2에서 `.env.production` 파일을 생성하고 실제 값으로 업데이트합니다:

```bash
cd /home/ubuntu/robovers-server
cp .env.production.example .env.production
nano .env.production
```

### 5. 필요한 파일 복사

EC2 인스턴스에 다음 파일들을 복사합니다:

```bash
# 로컬에서 EC2로 파일 복사
scp docker-compose.production.yml ubuntu@[EC2_HOST]:/home/ubuntu/robovers-server/
scp scripts/deploy-ec2.sh ubuntu@[EC2_HOST]:/home/ubuntu/robovers-server/scripts/
```

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