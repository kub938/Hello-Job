from fastapi import APIRouter
from app.services.company_analysis_service import setup_mcp_servers, company_analysis_news

router = APIRouter(prefix="/tests", tags=["tests"])

@router.get("")
async def tests():
    return {"message": "Hello, World!"}

@router.get("/mcp-servers")
async def get_mcp_servers():
    servers = await setup_mcp_servers()
    return [server.name for server in servers]

@router.get("/company-analysis/news")
async def get_company_analysis_news(company_name: str):
    return await company_analysis_news(company_name)