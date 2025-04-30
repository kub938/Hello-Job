# Python 경량 이미지
FROM python:3.12-slim

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 관리 파일 복사
COPY requirements.txt /app/

# 의존성 설치
RUN pip install -r requirements.txt

# 소스 코드 복사
COPY . /app/

# 포트 설정
EXPOSE 8000

# FastAPI 서버 실행 명령어
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]