FROM python:3.12-slim

WORKDIR /root/hellojob

RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# uv 설치 및 shell 재실행 -> 이 라인은 필요 없습니다. uv는 PATH에 추가됩니다.
RUN curl -LsSf https://astral.sh/uv/install.sh | bash
# RUN . $HOME/.local/bin/env # 이 라인은 제거하세요. 빌드 시 쉘에만 영향을 미칩니다.

# 패키지 설치
RUN python -m venv venv
COPY requirements.txt ./
# venv 활성화는 pip install 명령 내에서만 필요합니다.
RUN . venv/bin/activate && pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사 및 start script 복사
COPY main.py ./
COPY ./app ./app
COPY start.sh ./

# start script 실행 권한 부여
RUN chmod +x start.sh # 실행 권한 추가

# 포트 노출
EXPOSE 8000

# 컨테이너 시작 시 실행할 명령 추가
CMD ["/bin/bash", "-c", "/root/hellojob/start.sh"]