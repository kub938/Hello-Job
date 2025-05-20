# 빌드 스테이지
FROM node:22.3.0-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build
# 빌드 결과물 확인
RUN ls -la dist/

# 실행 스테이지
FROM nginx:stable-alpine

# nginx 기본 설정 삭제
RUN rm -rf /etc/nginx/conf.d/*

# Nginx 설정 추가
COPY --from=build /app/dist /usr/share/nginx/html
# 정적 파일 복사 확인
RUN ls -la /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 디버깅을 위한 nginx 로그 디렉토리 생성
RUN mkdir -p /var/log/nginx
RUN touch /var/log/nginx/error.log /var/log/nginx/access.log
RUN chmod 644 /var/log/nginx/error.log /var/log/nginx/access.log

# 포트 설정 - 전체 시스템에서 사용하는 포트와 일치
EXPOSE 5173

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
