import json
from dotenv import load_dotenv
from pydantic import BaseModel, create_model
from typing import List, Optional, Any
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

from app.schemas import company

load_dotenv()

async def setup_mcp_servers():
    servers = []
    
    try:
        # mcp.json 파일에서 설정 읽기
        with open('app/services/mcp.json', 'r') as f:
            config = json.load(f)
        
        # 구성된 MCP 서버들을 순회
        for server_name, server_config in config.get('mcpServers', {}).items():
            try:
                mcp_server = MCPServerStdio(
                    params={
                        "command": server_config.get("command"),
                        "args": server_config.get("args", [])
                    },
                    client_session_timeout_seconds=60,
                    cache_tools_list=True
                )
                print(f"MCP 서버 연결 시도: {server_name}")
                print(f"명령어: {server_config.get('command')}")
                print(f"인자: {server_config.get('args', [])}")
                
                await mcp_server.connect()
                servers.append(mcp_server)
            except FileNotFoundError as e:
                print(f"MCP 서버 {server_name} 연결 중 파일을 찾을 수 없음: {e}")
                print(f"찾을 수 없는 파일 경로: {server_config.get('command')} 또는 {server_config.get('args', [])}")
                raise
            except Exception as e:
                print(f"MCP 서버 {server_name} 연결 중 오류 발생: {e}")
                import traceback
                traceback.print_exc()
                raise
    except Exception as e:
        print(f"MCP 서버 설정 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        raise

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


async def format_company_analysis(result_obj: Any) -> str:
    """
    company_analysis_dart 함수의 Agent 결과 객체를 파싱하여
    지정된 형식의 문자열로 반환합니다. (default 섹션 제외)

    Args:
        result_obj: company_analysis_dart 함수의 Agent 최종 결과 객체 (Pydantic 모델 인스턴스).

    Returns:
        파싱된 정보를 포함하는 형식화된 문자열.
    """
    if not result_obj:
        return "분석 결과를 찾을 수 없습니다."

    output_lines = []

    # 영문 키 -> 한글 항목명 매핑 (default 키는 여기서 제외해도 되지만, 일단 유지)
    key_to_korean = {
        # base 섹션
        "business_overview": "사업 개요",
        "main_products_services": "주요 제품/서비스",
        "major_contracts_rd_activities": "주요 계약 및 R&D 활동",
        "other_references": "기타 참고사항",
        "sales_revenue": "매출액",
        "operating_profit": "영업이익",
        "net_income": "당기순이익",
        # plus 섹션
        "raw_materials_facilities": "원재료 및 설비",
        "sales_order_status": "수주 상황",
        "risk_management_derivatives": "리스크 관리 및 파생상품",
        # fin 섹션
        "total_assets": "자산총계",
        "total_liabilities": "부채총계",
        "total_equity": "자본총계",
        "operating_cash_flow": "영업활동 현금흐름",
        "investing_cash_flow": "투자활동 현금흐름",
        "financing_cash_flow": "재무활동 현금흐름",
        # default 섹션 (파싱에는 사용되지 않음)
        "company_brand": "기업 브랜드",
        "company_vision": "기업 비전"
    }

    # 섹션 처리 함수 (Pydantic 모델 객체 직접 처리)
    def process_section(section_obj: Optional[BaseModel], section_title: str):
        # 섹션 객체가 존재하고 None이 아닌지 확인
        if section_obj:
            # 섹션 객체를 딕셔너리로 변환하여 유효한 값이 있는지 확인
            # exclude_unset=True 등을 사용하여 기본값만 있는 빈 객체는 건너뛸 수도 있음
            section_data = section_obj.model_dump(exclude_none=True) # None 값 제외
            if section_data: # 실제 데이터가 있는 경우에만 섹션 추가
                output_lines.append(section_title)
                output_lines.append("---")
                for key, value in section_data.items():
                    korean_key = key_to_korean.get(key, key) # 매핑 없으면 원래 키 사용
                    output_lines.append(f"{korean_key}: {value}")
                output_lines.append("") # 섹션 간 빈 줄 추가

    # 각 섹션 처리 (default 제외)
    # getattr을 사용하여 해당 속성이 없거나 None일 경우 안전하게 처리
    process_section(getattr(result_obj, 'base', None), "기본")
    process_section(getattr(result_obj, 'plus', None), "심화")
    process_section(getattr(result_obj, 'fin', None), "재무")

    # 마지막 빈 줄 제거 및 최종 문자열 반환
    if output_lines and output_lines[-1] == "":
        output_lines.pop()

    return "\n".join(output_lines)


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
    
    # Agent에게 전달할 context 수정
    context = f"DART API를 활용하여 {company_name} 기업의 기업 분석 내용을 제공하세요. "
    context += "**반드시 '기업 브랜드 이미지 및 평판(company_brand)'과 '기업 비전 및 목표(company_vision)'를 분석하여 포함해야 합니다.** " # 강조 및 필수 명시
    context += "분석에 사용한 문서는 문서명과 문서등록일을 포함하여 used_docs에 추가하세요. "
    context += "포함할 내용은 다음과 같습니다: \n"
    context += "company_brand, company_vision, " # 필드명 다시 언급
    
    # 정형화된 agent 출력을 위한 Pydantic 모델 필드 정의 
    model_fields = {
        "used_docs": (List[str], ...),
        "default": (Optional[company.CompanyAnalysisDefault], None),
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

    # 정보 부재 시 처리 방법 명시 추가
    context += "\n\n만약 DART 문서에서 특정 항목(특히 company_brand, company_vision)에 대한 명확한 정보를 찾을 수 없다면, '정보 없음' 또는 '관련 정보 미발견'이라고 명시적으로 값에 포함하여 출력하세요. 절대로 null이나 None 값을 사용하지 마세요."

    # 동적으로 Pydantic 모델 생성 (정형화된 agent 출력을 위함)
    CompanyAnalysisOutput = create_model('CompanyAnalysisOutput', **model_fields)
    
    # OpenAI Agent 호출 
    agent, _ = await setup_agent(output_model=CompanyAnalysisOutput)

    # 기업 분석 Agent 실행 
    result = await Runner.run(agent, context)

    # Agent 결과가 없는 경우 처리
    if not result or not result.final_output:
        # 오류 처리 또는 기본값 반환 로직 필요
        # 예: 적절한 오류 응답이나 빈 응답 객체 반환
        # 여기서는 임시로 빈 응답 객체를 반환하도록 함
        # 실제 구현에서는 더 구체적인 오류 처리 필요
        print("Agent로부터 유효한 분석 결과를 받지 못했습니다.")
        # company.CompanyAnalysisResponse 모델을 직접 반환하려면 아래 수정 필요
        return {
            "company_brand": "기업 브랜드 정보를 가져오지 못했습니다.",
            "company_analysis": "기업 분석 정보를 가져오지 못했습니다.",
            "company_vision": "기업 비전 정보를 가져오지 못했습니다.",
        }

    # 포맷팅 
    formatted_result = await format_company_analysis(result.final_output)

    # 결과 객체 및 속성 접근 시 None 확인 추가
    company_brand = None
    company_vision = None
    if result.final_output.default:
        company_brand = result.final_output.default.company_brand
        company_vision = result.final_output.default.company_vision

    # company_analysis_dart 함수가 딕셔너리 대신 Pydantic 모델 객체를 반환하도록 수정
    # api/v1/endpoints/company_analysis.py 에서 응답 모델을 사용하므로
    # 해당 모델과 일치하는 데이터를 반환하거나, endpoint에서 처리하도록 함.
    # 여기서는 endpoint에서 CompanyAnalysisResponse를 생성한다고 가정하고
    # 필요한 데이터만 담은 딕셔너리를 반환 (기존 방식 유지)
    response = {
        "company_brand": company_brand,
        "company_analysis": formatted_result,
        "company_vision": company_vision,
    }
    
    return response
    
    
async def company_analysis_news(company_name):
    """OpenAI Agent 와 뉴스 데이터를 활용하여 기업 분석 결과를 반환합니다.

    Args:
        company_name (str): 기업 이름
    """
    pass