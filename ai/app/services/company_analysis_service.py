import json
from dotenv import load_dotenv
from pydantic import BaseModel, create_model
from typing import List, Optional
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

from app.schemas import company

load_dotenv()

async def setup_mcp_servers():
    servers = []
    
    # mcp.json 파일에서 설정 읽기
    with open('app/services/mcp.json', 'r') as f:
        config = json.load(f)
    
    # 구성된 MCP 서버들을 순회
    for server_name, server_config in config.get('mcpServers', {}).items():
        mcp_server = MCPServerStdio(
            params={
                "command": server_config.get("command"),
                "args": server_config.get("args", [])
            },
            cache_tools_list=True
        )
        await mcp_server.connect()
        servers.append(mcp_server)

    return servers


async def setup_agent(output_model):
    """OpenAI Agent 설정

    Args:
        output_model (BaseModel): 기업 분석 결과 타입 모델

    Returns:
        agent: OpenAI Agent
        mcp_servers: MCP 서버 리스트
    """
    mcp_servers = await setup_mcp_servers()
    
    agent = Agent(
        name="Company Analysis Assistant",
        instructions="당신은 기업 정보를 분석하고 상세한 리포트를 작성하는 도움을 주는 기업 분석 어시스턴트입니다.",
        model="gpt-4o",
        output_type=output_model,
        mcp_servers=mcp_servers
    )
    
    return agent, mcp_servers


async def company_analysis_dart(company_name, base, plus, fin):
    """OpenAI Agent 와 dart-mcp를 활용하여 기업 분석 결과를 반환합니다.

    Args:
        company_name (str): 기업 이름
        base (bool): 기본 정보 포함 여부
        plus (bool): 추가 정보 포함 여부
        fin (bool): 재무 정보 포함 여부
    """
    
    analysis_types = []
    if base:
        analysis_types.append("base")
    if plus:
        analysis_types.append("plus")
    if fin:
        analysis_types.append("fin")
    
    context = f"DART API를 활용하여 {company_name} 기업의 기업 분석 내용을 제공하세요. 분석에 사용한 문서는 문서명과 문서등록일을 포함하여 used_docs에 추가하세요. 포함할 내용은 다음과 같습니다. \n"
    
    # 정형화된 agent 출력을 위한 Pydantic 모델 필드 정의 
    model_fields = {
        "used_docs": (List[str], ...)
    }
    
    if "base" in analysis_types:
        model_fields["base"] = (Optional[company.CompanyAnalysisBase], None)
        # 사업 보고서 기본 내용
        context += "사업의 개요(business_overview), 주요 제품 및 서비스(main_products_services), 주요계약 및 연구개발활동(major_contracts_rd_activities), 기타 참고사항(other_references), " 
        # 재무 정보 기본 내용
        context += "매출액(sales_revenue), 영업이익(operating_profit), 당기순이익(net_income), "
        
    if "plus" in analysis_types:
        model_fields["plus"] = (Optional[company.CompanyAnalysisPlus], None)
        context += "원재료 및 생산설비(raw_materials_facilities), 매출 및 수주상황(sales_order_status), 위험관리 및 파생거래(risk_management_derivatives), "
        
    if "fin" in analysis_types:
        model_fields["fin"] = (Optional[company.CompanyAnalysisFin], None)
        # 재무 상태 심화 
        context += "자산 총계(total_assets), 부채 총계(total_liabilities), 자본 총계(total_equity), "
        # 현금흐름 심화 
        context += "영업활동 현금흐름(operating_cash_flow), 투자활동 현금흐름(investing_cash_flow), 재무활동 현금흐름(financing_cash_flow)"

    # 동적으로 Pydantic 모델 생성 (정형화된 agent 출력을 위함)
    CompanyAnalysisOutput = create_model('CompanyAnalysisOutput', **model_fields)
    
    print(context)
    print(CompanyAnalysisOutput)
    
    # OpenAI Agent 호출 
    agent, mcp_servers = await setup_agent(output_model=CompanyAnalysisOutput)

    # 기업 분석 Agent 실행 
    result = await Runner.run(agent, context)
    
    print(result)
    
    return result
    
async def company_analysis_news(company_name):
    """OpenAI Agent 와 뉴스 데이터를 활용하여 기업 분석 결과를 반환합니다.

    Args:
        company_name (str): 기업 이름
    """
    pass