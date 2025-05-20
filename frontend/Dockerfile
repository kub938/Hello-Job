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

# 실행 스테이지
FROM nginx:stable-alpine

# nginx 기본 설정 삭제
RUN rm -rf /etc/nginx/conf.d/*

# Nginx 설정 추가
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 포트 설정
EXPOSE 5173

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
