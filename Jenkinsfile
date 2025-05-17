pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE = 'docker-compose'
        // 현재 활성 환경 확인 (nginx 설정 기반)
        CURRENT_ENV = sh(script: '''
            if grep -q "weight=100" /etc/nginx/conf.d/default.conf | grep -q "blue"; then
                echo "blue"
            else
                echo "green"
            fi
        ''', returnStdout: true).trim()
    }
    
    stages {
        stage('Notification - Build Started') {
            steps {
                script {
                    def userName = getUserName()
                    echo "Detected user for build start: ${userName}"
                    
                    withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'WEBHOOK_URL')]) {
                        sh '''
                            curl -X POST -H "Content-Type: application/json" -d '{
                                "text": "🚀 ''' + userName + '''(이)가 요청한 블루-그린 빌드 시작! ''' + env.JOB_NAME + ''' #''' + env.BUILD_NUMBER + '''"
                            }' $WEBHOOK_URL
                        '''
                    }
                }
            }
        }
        
        stage('Prepare Environment') {
            steps {
                script {
                    NEW_ENV = CURRENT_ENV == 'blue' ? 'green' : 'blue'
                    echo "Current Environment: ${CURRENT_ENV}"
                    echo "New Environment: ${NEW_ENV}"
                    
                    // 공유 서비스 시작 (처음 실행 시)
                   sh '''
                        # 먼저 필요한 네트워크 생성
                        docker network create shared-network || true
                        
                        if ! docker ps | grep -q nginx-proxy; then
                            echo "Starting shared services..."
                            docker-compose -f docker-compose.shared.yml up -d
                        fi
                    '''
                }
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "Checked out Branch: ${env.BRANCH_NAME}"
                }
            }
        }
        
        stage('Build') {
            failFast true
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'chmod +x gradlew'
                            sh './gradlew clean build -x test'
                        }
                    }
                }
                
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Deploy to New Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'DB_URL', variable: 'DB_URL'),
                        string(credentialsId: 'DB_USERNAME', variable: 'DB_USERNAME'),
                        string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                        string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_CLIENT_SECRET'),
                        string(credentialsId: 'GOOGLE_REDIRECT_URL', variable: 'GOOGLE_REDIRECT_URL'),
                        string(credentialsId: 'JWT_SECRET_KEY', variable: 'JWT_SECRET_KEY'),
                        string(credentialsId: 'MYSQL_USER', variable: 'MYSQL_USER'),
                        string(credentialsId: 'MYSQL_PASSWORD', variable: 'MYSQL_PASSWORD'),
                        string(credentialsId: 'MYSQL_ROOT_PASSWORD', variable: 'MYSQL_ROOT_PASSWORD'),
                        string(credentialsId: 'SERVER_DOMAIN', variable: 'SERVER_DOMAIN'),
                        string(credentialsId: 'FRONTEND_URL', variable: 'FRONTEND_URL'),
                        string(credentialsId: 'OPENAI_API_KEY', variable: 'OPENAI_API_KEY'),
                        string(credentialsId: 'DART_API_KEY', variable: 'DART_API_KEY'),
                        string(credentialsId: 'FASTAPI_URL', variable: 'FASTAPI_URL'),
                        string(credentialsId: 'NAVER_CLIENT_ID', variable: 'NAVER_CLIENT_ID'),
                        string(credentialsId: 'NAVER_CLIENT_SECRET', variable: 'NAVER_CLIENT_SECRET'),
                        string(credentialsId: 'AES_SECRET_KEY', variable: 'AES_SECRET_KEY'),
                        string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'MATTERMOST_WEBHOOK'),
                        string(credentialsId: 'OPENAI_API_URL', variable: 'OPENAI_API_URL'),
                        string(credentialsId: 'S3_ACCESS_KEY', variable: 'S3_ACCESS_KEY'),
                        string(credentialsId: 'S3_SECRET_KEY', variable: 'S3_SECRET_KEY'),
                        string(credentialsId: 'GMS_KEY', variable: 'GMS_KEY'),
                        string(credentialsId: 'GMS_API_BASE', variable: 'GMS_API_BASE'),
                        string(credentialsId: 'FFPROBE_PATH', variable: 'FFPROBE_PATH'),
                        string(credentialsId: 'FFMPEG_PATH', variable: 'FFMPEG_PATH')

                    ]) {
                        sh """
                            echo "🔄 Building new environment: ${NEW_ENV}..."
                            docker-compose -f docker-compose.${NEW_ENV}.yml build \
                                --build-arg DB_URL=\$DB_URL \
                                --build-arg DB_USERNAME=\$DB_USERNAME \
                                --build-arg DB_PASSWORD=\$DB_PASSWORD \
                                --build-arg MYSQL_USER=\$MYSQL_USER \
                                --build-arg MYSQL_PASSWORD=\$MYSQL_PASSWORD \
                                --build-arg MYSQL_ROOT_PASSWORD=\$MYSQL_ROOT_PASSWORD \
                                --build-arg JWT_SECRET_KEY=\$JWT_SECRET_KEY \
                                --build-arg GOOGLE_CLIENT_ID=\$GOOGLE_CLIENT_ID \
                                --build-arg GOOGLE_CLIENT_SECRET=\$GOOGLE_CLIENT_SECRET \
                                --build-arg GOOGLE_REDIRECT_URL=\$GOOGLE_REDIRECT_URL \
                                --build-arg SERVER_DOMAIN=\$SERVER_DOMAIN \
                                --build-arg FRONTEND_URL=\$FRONTEND_URL \
                                --build-arg OPENAI_API_KEY=\$OPENAI_API_KEY \
                                --build-arg DART_API_KEY=\$DART_API_KEY \
                                --build-arg FASTAPI_URL=\$FASTAPI_URL \
                                --build-arg NAVER_CLIENT_ID=\$NAVER_CLIENT_ID \
                                --build-arg NAVER_CLIENT_SECRET=\$NAVER_CLIENT_SECRET \
                                --build-arg AES_SECRET_KEY=\$AES_SECRET_KEY \
                                --build-arg MATTERMOST_WEBHOOK=\$MATTERMOST_WEBHOOK \
                                --build-arg OPENAI_API_URL=\$OPENAI_API_URL \
                                --build-arg S3_ACCESS_KEY=\$S3_ACCESS_KEY \
                                --build-arg S3_SECRET_KEY=\$S3_SECRET_KEY \
                                --build-arg GMS_KEY=\$GMS_KEY \
                                --build-arg GMS_API_BASE=\$GMS_API_BASE \
                                --build-arg FFPROBE_PATH=\$FFPROBE_PATH \
                                --build-arg FFMPEG_PATH=\$FFMPEG_PATH


                            echo "🚀 Starting new environment: ${NEW_ENV}..."
                            docker-compose -f docker-compose.${NEW_ENV}.yml up -d
                        """
                    }
                }
            }
        }

        stage('Simple Wait') {
            steps {
                script {
                    echo "⏳ Waiting for services to start up (2 minutes)..."
                    sleep(time: 2, unit: 'MINUTES')
                    echo "✅ Wait completed"
                }
            }
        }
        
        stage('Switch Traffic') {
            steps {
                script {
                    sh """
                        echo "🔄 Switching traffic to ${NEW_ENV} environment..."
                        
                        # Nginx 컨테이너 내에서 설정 파일 수정
                        docker exec nginx-proxy bash -c '
                            # Nginx 설정 파일 백업
                            cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup || echo "Backup failed but continuing"
                            
                            # 새 환경으로 트래픽 전환
                            if [ "${NEW_ENV}" == "blue" ]; then
                                # Blue 환경으로 전환
                                sed -i "s/server backend-blue:8080 weight=0;/server backend-blue:8080 weight=100;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server backend-green:8080 weight=100;/server backend-green:8080 weight=0;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server frontend-blue:5173 weight=0;/server frontend-blue:5173 weight=100;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server frontend-green:5173 weight=100;/server frontend-green:5173 weight=0;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server ai-blue:8000 weight=0;/server ai-blue:8000 weight=100;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server ai-green:8000 weight=100;/server ai-green:8000 weight=0;/g" /etc/nginx/conf.d/default.conf
                            else
                                # Green 환경으로 전환
                                sed -i "s/server backend-blue:8080 weight=100;/server backend-blue:8080 weight=0;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server backend-green:8080 weight=0;/server backend-green:8080 weight=100;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server frontend-blue:5173 weight=100;/server frontend-blue:5173 weight=0;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server frontend-green:5173 weight=0;/server frontend-green:5173 weight=100;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server ai-blue:8000 weight=100;/server ai-blue:8000 weight=0;/g" /etc/nginx/conf.d/default.conf
                                sed -i "s/server ai-green:8000 weight=0;/server ai-green:8000 weight=100;/g" /etc/nginx/conf.d/default.conf
                            fi
                            
                            # Nginx 설정 테스트 및 재로드
                            nginx -t
                            if [ \$? -eq 0 ]; then
                                nginx -s reload
                                echo "✅ Traffic switched to ${NEW_ENV} environment"
                            else
                                echo "❌ Nginx configuration error!"
                                cp /etc/nginx/conf.d/default.conf.backup /etc/nginx/conf.d/default.conf
                                exit 1
                            fi
                        '
                    """
                }
            }
        }
        
        stage('Cleanup Old Environment') {
            steps {
                script {
                    sh """
                        echo "🧹 Cleaning up old environment: ${CURRENT_ENV}..."
                        docker-compose -f docker-compose.${CURRENT_ENV}.yml down
                        
                        echo "🗑️ Removing old Docker images..."
                        docker rmi workspace-backend || true
                        docker rmi workspace-frontend || true
                        docker rmi workspace-ai || true
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline succeeded!'
            script {
                def userName = getUserName()
                withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'WEBHOOK_URL')]) {
                    sh """
                        curl -X POST -H 'Content-Type: application/json' -d '{
                            "text": "✅ ${userName}(이)가 요청한 블루-그린 빌드 성공! ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                        }' \$WEBHOOK_URL
                    """
                }
            }
        }
        failure {
            echo '❌ Pipeline failed!'
            script {
                def userName = getUserName()
                
                // 롤백 시도
                sh """
                    echo "🔄 Rolling back to ${CURRENT_ENV} environment..."
                    docker-compose -f docker-compose.${NEW_ENV}.yml down
                    
                    # Nginx 설정 롤백
                    if [ -f /etc/nginx/conf.d/default.conf.backup ]; then
                        cp /etc/nginx/conf.d/default.conf.backup /etc/nginx/conf.d/default.conf
                        nginx -s reload
                    fi
                """
                
                sh "${DOCKER_COMPOSE} logs > pipeline_failure.log"
                
                withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'WEBHOOK_URL')]) {
                    sh """
                        curl -X POST -H 'Content-Type: application/json' -d '{
                            "text": "❌ ${userName}(이)가 요청한 블루-그린 빌드 실패! ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                        }' \$WEBHOOK_URL
                    """
                }
            }
        }
    }
}

def getUserName() {
    def userName = "Unknown"
    try {
        userName = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
    } catch (Exception e) {
        echo "Git author extraction failed: ${e.message}"
    }
    return userName ?: "Unknown"
}