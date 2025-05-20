pipeline {  // 파이프라인 정의 시작
    agent any  // Jenkins 에이전트에서 어떤 노드에서든 실행 가능
    
    environment {  // 파이프라인에서 사용할 환경 변수 정의
        DOCKER_COMPOSE = 'docker-compose'  // docker-compose 명령어를 환경 변수로 설정
    }
    
    stages {  // 파이프라인의 주요 단계들 정의

        stage('Notification - Build Started') {
            steps {
                script {
                    // 사용자 감지 로직
                    def userName = getUserName()
                    echo "Detected user for build start: ${userName}"
                    
                    // 알림 전송
                    withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'WEBHOOK_URL')]) {
                        sh '''
                            curl -X POST -H "Content-Type: application/json" -d '{
                                "text": "🚀 ''' + userName + '''(이)가 요청한 빌드 시작! ''' + env.JOB_NAME + ''' #''' + env.BUILD_NUMBER + '''"
                            }' $WEBHOOK_URL
                        '''
                    }
                }
            }
        }
        
        stage('Checkout') {  // 첫 번째 단계: 코드 체크아웃
            steps {
                checkout scm  // 소스 코드 관리(SCM)에서 현재 브랜치의 코드 체크아웃
                script {
                    echo "Checked out Branch: ${env.BRANCH_NAME}"   // 단순 체크아웃 브렌치 출력 코드.
                }
            }
        }
        
        // stage('Build') {  // 두 번째 단계: 빌드
        //     failFast true  // 하나라도 실패하면 전체 중단
        //     parallel {  // 병렬로 Backend와 Frontend 작업 수행
        //         stage('Backend') {  // Backend 처리 단계
        //             steps {  // Backend 빌드 및 테스트 수행
        //                 dir('backend') {  // backend 디렉토리로 이동
        //                     sh 'chmod +x gradlew'  // 실행 권한 부여
        //                     sh './gradlew clean build -x test'  // Gradle로 클린 빌드
        //                 }
        //             }
        //         }
                
        //         stage('Frontend') {  // Frontend 처리 단계
        //             steps {  // Frontend 빌드 및 테스트 수행
        //                 dir('frontend') {  // frontend 디렉토리로 이동
        //                     sh 'npm install'  // 필요한 패키지 설치
        //                     sh 'npm run build'  // 빌드 실행
        //                 }
        //             }
        //         }
        //         // AI는 빌드 단계에서 제외.
        //     }
        // }
        
        stage('Docker Build and Deploy') {  // Docker 빌드 및 배포 단계
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
                        sh '''
                            echo "🔄 Stopping existing containers..."
                            docker-compose down

                            mkdir -p certbot/conf
                            mkdir -p certbot/www
                            
                            echo "🔄 Building Docker images..."
                            docker-compose build \
                                --build-arg DB_URL=$DB_URL \
                                --build-arg DB_USERNAME=$DB_USERNAME \
                                --build-arg DB_PASSWORD=$DB_PASSWORD \
                                --build-arg MYSQL_USER=$MYSQL_USER \
                                --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
                                --build-arg MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
                                --build-arg JWT_SECRET_KEY=$JWT_SECRET_KEY \
                                --build-arg GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
                                --build-arg GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
                                --build-arg GOOGLE_REDIRECT_URL=$GOOGLE_REDIRECT_URL \
                                --build-arg SERVER_DOMAIN=$SERVER_DOMAIN \
                                --build-arg FRONTEND_URL=$FRONTEND_URL \
                                --build-arg OPENAI_API_KEY=$OPENAI_API_KEY \
                                --build-arg DART_API_KEY=$DART_API_KEY \
                                --build-arg FASTAPI_URL=$FASTAPI_URL \
                                --build-arg NAVER_CLIENT_ID=$NAVER_CLIENT_ID \
                                --build-arg NAVER_CLIENT_SECRET=$NAVER_CLIENT_SECRET \
                                --build-arg AES_SECRET_KEY=$AES_SECRET_KEY \
                                --build-arg MATTERMOST_WEBHOOK=$MATTERMOST_WEBHOOK \
                                --build-arg OPENAI_API_URL=$OPENAI_API_URL \
                                --build-arg S3_ACCESS_KEY=$S3_ACCESS_KEY \
                                --build-arg S3_SECRET_KEY=$S3_SECRET_KEY \
                                --build-arg GMS_KEY=$GMS_KEY \
                                --build-arg GMS_API_BASE=$GMS_API_BASE \
                                --build-arg FFPROBE_PATH=$FFPROBE_PATH \
                                --build-arg FFMPEG_PATH=$FFMPEG_PATH

                            echo "🧹 Removing local Docker images..."
                            docker rmi workspace-backend || true
                            docker rmi workspace-frontend || true
                            docker rmi workspace-ai || true

                            echo "🚀 Starting containers..."
                            docker-compose up -d
                        '''
                    }
                }
            }
        }
    }
    
    post {  // 파이프라인 종료 후 처리
         success {
            echo '✅ Pipeline succeeded!'

            script {
                // 성공 시 사용자 이름 다시 가져오기
                def userName = getUserName()
                
                withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'WEBHOOK_URL')]) {
                    sh """
                        curl -X POST -H 'Content-Type: application/json' -d '{
                            "text": "✅ ${userName}(이)가 요청한 빌드 성공! ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                        }' \$WEBHOOK_URL
                    """
                }
            }
        }
        failure {
            echo '❌ Pipeline failed!'

            sh "${DOCKER_COMPOSE} down"
            sh "${DOCKER_COMPOSE} logs > pipeline_failure.log"  // 실패 시 로그 저장  

             script {
                // 실패 시 사용자 이름 다시 가져오기
                def userName = getUserName()
                
                withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'WEBHOOK_URL')]) {
                    sh """
                        curl -X POST -H 'Content-Type: application/json' -d '{
                            "text": "❌ ${userName}(이)가 요청한 빌드 실패! ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                        }' \$WEBHOOK_URL
                    """
                }
            }
        }
    }
}


// 사용자 이름 가져오는 함수 정의
def getUserName() {
    def userName = "Unknown"
    try {
        userName = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
    } catch (Exception e) {
        echo "Git author extraction failed: ${e.message}"
    }
    return userName ?: "Unknown"
}