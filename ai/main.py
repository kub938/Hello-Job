from fastapi import FastAPI
from app.api.v1.endpoints import company_analysis

app = FastAPI()

# 라우터 추가
app.include_router(company_analysis.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Hello Job"} 