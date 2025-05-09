from fastapi import APIRouter
from app.services.company_analysis_service import company_analysis_news
from app.core.mcp_core import setup_mcp_servers, get_mcp_servers
from app.mcp.dart_mcp import dart
router = APIRouter(prefix="/tests", tags=["tests"])

@router.get("")
async def tests():
    return {"message": "Hello, World!"}

@router.get("/mcp-servers")
async def test_mcp_servers():
    # 현재 초기화된 MCP 서버 목록 반환
    current_servers = get_mcp_servers()
    if current_servers:
        return [server.name for server in current_servers]
    
    # 현재 서버가 없는 경우 새로 설정
    servers = await setup_mcp_servers()
    return [server.name for server in servers]

@router.get("/company-analysis/news")
async def get_company_analysis_news(company_name: str):
    return await company_analysis_news(company_name)

@router.get("/dart-mcp/get_corp_code_by_name")
async def get_corp_code_by_name(company_name: str):
    return await dart.get_corp_code_by_name(company_name)