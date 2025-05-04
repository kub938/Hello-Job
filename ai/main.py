from fastapi import FastAPI
<<<<<<< HEAD
from app.api.v1.endpoints import company_analysis, tests

app = FastAPI()

API_V1_STR = "/api/v1/ai"

# 라우터 추가
app.include_router(company_analysis.router, prefix=API_V1_STR)
app.include_router(tests.router, prefix=API_V1_STR)

@app.get(f"{API_V1_STR}")

async def root():
    return {"message": "Hello World"} 