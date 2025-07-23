#!/bin/bash

set -e

echo "🔧 Starting EC2 setup for Robovers Server..."

# Ubuntu 시스템 업데이트
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Docker 설치
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # 현재 사용자를 docker 그룹에 추가
    sudo usermod -aG docker $USER
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker is already installed"
fi

# Docker Compose 설치
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose is already installed"
fi

# AWS CLI 설치
echo "☁️  Installing AWS CLI..."
if ! command -v aws &> /dev/null; then
    # unzip 설치 확인 및 설치
    if ! command -v unzip &> /dev/null; then
        echo "📦 Installing unzip..."
        sudo apt-get install -y unzip
    fi
    
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf awscliv2.zip aws/
    echo "✅ AWS CLI installed successfully"
else
    echo "✅ AWS CLI is already installed"
fi

# 프로젝트 디렉토리 생성
echo "📁 Creating project directory..."
mkdir -p /home/ubuntu/robovers-server
cd /home/ubuntu/robovers-server

# 필요한 파일 복사 (GitHub Actions에서 수행)
echo "📋 Creating environment file template..."
cat > .env.production.example << EOF
# Production Environment Variables
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
EOF

echo "⚠️  Important: Copy .env.production.example to .env.production and update with actual values"

# ECR 로그인 설정
echo "🔐 Setting up ECR login..."
aws configure set region ap-northeast-2

# 시스템 서비스 생성 (선택사항)
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/robovers.service > /dev/null << EOF
[Unit]
Description=Robovers Server
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/robovers-server
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
echo "✅ Systemd service created (robovers.service)"

# 로그 디렉토리 생성
echo "📁 Creating log directory..."
sudo mkdir -p /var/log/robovers
sudo chown ubuntu:ubuntu /var/log/robovers

echo "🎉 EC2 setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Configure .env.production with actual values"
echo "2. Copy docker-compose.production.yml and deploy-ec2.sh to this server"
echo "3. Configure AWS credentials: aws configure"
echo "4. Run the deployment: ./deploy-ec2.sh"
echo "5. (Optional) Enable systemd service: sudo systemctl enable robovers.service"