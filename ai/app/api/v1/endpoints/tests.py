from fastapi import APIRouter
from app.core.mcp_core import setup_mcp_servers, get_mcp_servers
from app.mcp.dart_mcp import dart
from app.services import interview_service
from app.schemas import interview
import logging

logger = logging.getLogger(__name__)

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

@router.get("/dart-mcp/get_corp_code_by_name")
async def get_corp_code_by_name(company_name: str):
    return await dart.get_corp_code_by_name(company_name)


@router.post("/interview/parse-user-info")
async def test_parse_user_info(request: interview.CreateQuestionRequest):
    result = await interview_service.parse_user_info(request)
    return result


@router.post("/gms")
async def test_gms(user_input: str):
    import os 
    from agents import Agent, Runner, OpenAIChatCompletionsModel
    from openai import AsyncOpenAI
    
    GMS_KEY  = os.getenv("GMS_KEY")
    GMS_API_BASE = os.getenv("GMS_API_BASE")
    
    if not GMS_KEY or not GMS_API_BASE:
        return {"message": "GMS_KEY or GMS_API_BASE is not set"}
    
    gms_client = AsyncOpenAI(api_key=GMS_KEY, base_url=GMS_API_BASE)
    
    logger.info(f"OpenAI Client: {gms_client}")
    logger.info(f"Client api key: {gms_client.api_key}")
    logger.info(f"Client base url: {gms_client.base_url}")
    
    # gms_client 를 사용한 모델 지정 
    gms_model = OpenAIChatCompletionsModel(
        model="gpt-4.1",
        openai_client=gms_client
    )
    
    agent = Agent(
        name="GMS Agent",
        instructions="You are a helpful assistant that can answer questions and help with tasks.",
        model=gms_model
    )
    
    result = await Runner.run(agent, user_input)
    
    # 직렬화 가능한 형태로 결과 변환
    serializable_result = {
        "message": result.response if hasattr(result, "response") else str(result),
        "status": "success"
    }
    
    return serializable_result