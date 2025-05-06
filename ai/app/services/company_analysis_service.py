import json
import os
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
                # 환경 변수 설정
                env_vars = server_config.get("env", {}).copy()
                
                # 모든 환경 변수를 .env 파일에서 로드
                if "env" in server_config:
                    for key in list(env_vars.keys()):
                        # .env 파일에서 환경 변수 가져오기
                        env_value = os.getenv(key)
                        if env_value:
                            env_vars[key] = env_value
                        else:
                            print(f"경고: {key} 환경 변수가 .env 파일에 설정되지 않았습니다.")
                
                mcp_server = MCPServerStdio(
                    name=server_name,
                    params={
                        "command": server_config.get("command"),
                        "args": server_config.get("args", []),
                        "env": env_vars
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

# OpenAI Agent 설정 -> 현재 사용 x 
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
        instructions="당신은 기업 정보를 분석하고 상세한 리포트를 작성하는 도움을 주는 기업 분석 어시스턴트입니다. 다양한 MCP를 활용하여 기업 분석 결과 혹은 뉴스 기사 분석 데이터를 반환합니다.",
        model="gpt-4.1",
        output_type=output_model,
        mcp_servers=mcp_servers
    )
    
    return agent, mcp_servers


async def format_company_analysis(result_obj: Any) -> str:
    """
    company_analysis_dart 함수의 Agent 결과 객체를 파싱하여
    지정된 형식의 문자열로 반환합니다. (default 섹션 제외)
    재무 정보(sales_revenue, operating_profit, net_income, fin 섹션 전체)는 제외합니다.

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
        # base 섹션 (재무 정보 제외)
        "business_overview": "사업 개요",
        "main_products_services": "주요 제품/서비스",
        "major_contracts_rd_activities": "주요 계약 및 R&D 활동",
        "other_references": "기타 참고사항",
        # plus 섹션
        "raw_materials_facilities": "원재료 및 설비",
        "sales_order_status": "수주 상황",
        "risk_management_derivatives": "리스크 관리 및 파생상품",
        # 재무 정보 관련 키 (제외 대상)
        "sales_revenue": None,
        "operating_profit": None,
        "net_income": None,
        "total_assets": None,
        "total_liabilities": None,
        "total_equity": None,
        "operating_cash_flow": None,
        "investing_cash_flow": None,
        "financing_cash_flow": None,
        # default 섹션 (파싱에는 사용되지 않음)
        "company_brand": "기업 브랜드",
        "company_vision": "기업 비전"
    }

    # 섹션 처리 함수 (Pydantic 모델 객체 직접 처리 및 재무 정보 제외)
    def process_section(section_obj: Optional[BaseModel], section_title: str):
        # 섹션 객체가 존재하고 None이 아닌지 확인
        if section_obj:
            # 섹션 객체를 딕셔너리로 변환하여 유효한 값이 있는지 확인
            section_data = section_obj.model_dump(exclude_none=True) # None 값 제외
            
            # 재무 정보 제외
            filtered_data = {}
            for key, value in section_data.items():
                if key_to_korean.get(key) is not None:  # None이 아닌 키만 포함
                    filtered_data[key] = value
                    
            if filtered_data:  # 실제 데이터가 있는 경우에만 섹션 추가
                output_lines.append(section_title)
                output_lines.append("---")
                for key, value in filtered_data.items():
                    korean_key = key_to_korean.get(key, key)  # 매핑 없으면 원래 키 사용
                    output_lines.append(f"{korean_key}: {value}")
                output_lines.append("")  # 섹션 간 빈 줄 추가

    # 각 섹션 처리 (default 제외)
    # getattr을 사용하여 해당 속성이 없거나 None일 경우 안전하게 처리
    process_section(getattr(result_obj, 'base', None), "기본")
    process_section(getattr(result_obj, 'plus', None), "심화")
    # fin 섹션은 company_finance에 포함되므로 여기서 제외
    
    # 마지막 빈 줄 제거 및 최종 문자열 반환
    if output_lines and output_lines[-1] == "":
        output_lines.pop()

    return "\n".join(output_lines)


# DART 기업 분석 결과 반환 -> 현재 사용 x 
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
    context += "**반드시 '주요 제품 및 브랜드(company_brand)'과 '기업 비전(company_vision)'를 분석하여 포함해야 합니다.** " # 강조 및 필수 명시
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
    context += "\n\n또한, DART 문서에 명시적으로 포함되지 않은 항목(주요 제품 및 브랜드, 기업 비전)은 Search MCP 를 활용하여 정보를 찾아서 포함하고, 적당한 정보가 없다면 '정보 없음'이라고 명시적으로 값에 포함하여 출력하세요."
    # 동적으로 Pydantic 모델 생성 (정형화된 agent 출력을 위함)
    CompanyAnalysisOutput = create_model('CompanyAnalysisOutput', **model_fields)
    
    # OpenAI Agent 호출 
    agent, _ = await setup_agent(output_model=CompanyAnalysisOutput)

    # 기업 분석 Agent 실행 
    result = await Runner.run(starting_agent=agent, input=context, max_turns=30)

    # Agent 결과가 없는 경우 처리
    if not result or not result.final_output:
        # 오류 처리 또는 기본값 반환 로직 필요
        print("Agent로부터 유효한 분석 결과를 받지 못했습니다.")
        return {
            "company_brand": "기업 브랜드 정보를 가져오지 못했습니다.",
            "company_analysis": "기업 분석 정보를 가져오지 못했습니다.",
            "company_vision": "기업 비전 정보를 가져오지 못했습니다.",
            "company_finance": "기업 재정상황 정보를 가져오지 못했습니다.",
        }

    # 포맷팅 
    formatted_result = await format_company_analysis(result.final_output)
    
    # 재무 정보 포맷팅
    company_finance = ""
    if base or fin:
        finance_data = []
        
        # base=True인 경우 기본 재무 정보 추가
        if base and result.final_output.base:
            base_finance = result.final_output.base.model_dump(exclude_none=True)
            if "sales_revenue" in base_finance:
                finance_data.append(f"매출액: {base_finance['sales_revenue']}")
            if "operating_profit" in base_finance:
                finance_data.append(f"영업이익: {base_finance['operating_profit']}")
            if "net_income" in base_finance:
                finance_data.append(f"당기순이익: {base_finance['net_income']}")
                
        # fin=True인 경우 심화 재무 정보 추가
        if fin and result.final_output.fin:
            fin_finance = result.final_output.fin.model_dump(exclude_none=True)
            
            # 재무상태 정보
            if "total_assets" in fin_finance:
                finance_data.append(f"자산 총계: {fin_finance['total_assets']}")
            if "total_liabilities" in fin_finance:
                finance_data.append(f"부채 총계: {fin_finance['total_liabilities']}")
            if "total_equity" in fin_finance:
                finance_data.append(f"자본 총계: {fin_finance['total_equity']}")
                
            # 현금흐름 정보
            if "operating_cash_flow" in fin_finance:
                finance_data.append(f"영업활동 현금흐름: {fin_finance['operating_cash_flow']}")
            if "investing_cash_flow" in fin_finance:
                finance_data.append(f"투자활동 현금흐름: {fin_finance['investing_cash_flow']}")
            if "financing_cash_flow" in fin_finance:
                finance_data.append(f"재무활동 현금흐름: {fin_finance['financing_cash_flow']}")
                
        company_finance = "\n".join(finance_data) if finance_data else "재무 정보가 포함되지 않았습니다."

    # 결과 객체 및 속성 접근 시 None 확인 추가
    company_brand = "정보 없음"
    company_vision = "정보 없음"
    if result.final_output.default:
        company_brand = result.final_output.default.company_brand or "정보 없음"
        company_vision = result.final_output.default.company_vision or "정보 없음"

    # API 명세에 맞는 응답 형식으로 변환
    response = {
        "company_brand": company_brand,
        "company_analysis": formatted_result,
        "company_vision": company_vision,
        "company_finance": company_finance,
    }
    
    return response
    
    
# 뉴스 데이터 분석 결과 반환 -> 현재 사용 x 
async def company_analysis_news(company_name):
    """OpenAI Agent 와 뉴스 데이터를 활용하여 기업 분석 결과를 반환합니다.

    Args:
        company_name (str): 기업 이름
    """
    agent, _ = await setup_agent(output_model=company.CompanyNews)
    
    num_news = 30
    context = f"뉴스 데이터를 활용하여 {company_name} 기업의 기업 분석 내용을 제공하세요. 뉴스 기사는 최신 순으로 {num_news}개를 가져오며, 뉴스 제목이 중복되는 경우에는 제외합니다. "
    context += "포함할 내용은 다음과 같습니다: \n"
    context += "summary, urls" # 필드명 다시 언급
    
    result = await Runner.run(starting_agent=agent, input=context, max_turns=30)

    # print(result)
    
    return result.final_output


# 기업 분석 및 뉴스 데이터 분석 결과 반환 -> 현재 사용 o
async def company_analysis_all(company_name, base, plus, fin):
    """OpenAI Agent 와 MCP를 활용하여 기업 분석 및 뉴스 데이터를 한번에 분석하여 반환합니다.

    Args:
        company_name (str): 기업 이름
        base (bool): 기본 정보 포함 여부
        plus (bool): 추가 정보 포함 여부
        fin (bool): 재무 정보 포함 여부
    
    Returns:
        dict: 기업 분석 및 뉴스 분석 결과를 포함한 딕셔너리
    """
    # MCP 서버를 한 번만 설정
    mcp_servers = await setup_mcp_servers()
    
    # 1. DART 기업 분석 수행
    analysis_types = []
    if base:
        analysis_types.append("base")
    if plus:
        analysis_types.append("plus")
    if fin:
        analysis_types.append("fin")
    
    # DART 분석을 위한 Agent 설정
    # 정형화된 agent 출력을 위한 Pydantic 모델 필드 정의 
    model_fields = {
        "used_docs": (List[str], ...),
        "default": (Optional[company.CompanyAnalysisDefault], None),
    }
    
    if "base" in analysis_types:
        model_fields["base"] = (Optional[company.CompanyAnalysisBase], None)
    if "plus" in analysis_types:
        model_fields["plus"] = (Optional[company.CompanyAnalysisPlus], None)
    if "fin" in analysis_types:
        model_fields["fin"] = (Optional[company.CompanyAnalysisFin], None)
        
    # 동적으로 Pydantic 모델 생성 (정형화된 agent 출력을 위함)
    CompanyAnalysisOutput = create_model('CompanyAnalysisOutput', **model_fields)
    
    dart_agent = Agent(
        name="Company Analysis Assistant",
        instructions="당신은 기업 정보를 분석하고 상세한 리포트를 작성하는 도움을 주는 기업 분석 어시스턴트입니다. 다양한 MCP를 활용하여 기업 분석 결과 혹은 뉴스 기사 분석 데이터를 반환합니다.",
        model="gpt-4.1",
        output_type=CompanyAnalysisOutput,
        mcp_servers=mcp_servers
    )
    
    # Agent에게 전달할 context 수정
    dart_context = f"DART API를 활용하여 {company_name} 기업의 기업 분석 내용을 제공하세요. "
    dart_context += "**반드시 '주요 제품 및 브랜드(company_brand)'과 '기업 비전(company_vision)'를 분석하여 포함해야 합니다.** " # 강조 및 필수 명시
    dart_context += "분석에 사용한 문서는 문서명과 문서등록일을 포함하여 used_docs에 추가하세요. "
    dart_context += "포함할 내용은 다음과 같습니다: \n"
    dart_context += "company_brand, company_vision, " # 필드명 다시 언급
    
    if "base" in analysis_types:
        # 사업 보고서 기본 내용
        dart_context += "사업의 개요(business_overview), 주요 제품 및 서비스(main_products_services), 주요계약 및 연구개발활동(major_contracts_rd_activities), 기타 참고사항(other_references), " 
        # 재무 정보 기본 내용
        dart_context += "매출액(sales_revenue), 영업이익(operating_profit), 당기순이익(net_income), "
        
    if "plus" in analysis_types:
        dart_context += "원재료 및 생산설비(raw_materials_facilities), 매출 및 수주상황(sales_order_status), 위험관리 및 파생거래(risk_management_derivatives), "
        
    if "fin" in analysis_types:
        # 재무 상태 심화 
        dart_context += "자산 총계(total_assets), 부채 총계(total_liabilities), 자본 총계(total_equity), "
        # 현금흐름 심화 
        dart_context += "영업활동 현금흐름(operating_cash_flow), 투자활동 현금흐름(investing_cash_flow), 재무활동 현금흐름(financing_cash_flow)"

    # 정보 부재 시 처리 방법 명시 추가
    dart_context += "\n\n또한, DART 문서에 명시적으로 포함되지 않은 항목(주요 제품 및 브랜드, 기업 비전)은 Search MCP 를 활용하여 정보를 찾아서 포함하고, 적당한 정보가 없다면 '정보 없음'이라고 명시적으로 값에 포함하여 출력하세요."
    
    # DART 분석 실행
    dart_result = await Runner.run(starting_agent=dart_agent, input=dart_context, max_turns=30)
    
    # 2. 뉴스 데이터 분석 수행
    news_agent = Agent(
        name="Company News Analyzer",
        instructions="당신은 기업 뉴스를 분석하고 요약하는 어시스턴트입니다. 다양한 MCP를 활용하여 뉴스 기사 분석 데이터를 반환합니다.",
        model="gpt-4.1",
        output_type=company.CompanyNews,
        mcp_servers=mcp_servers
    )
    
    num_news = 30
    news_context = f"뉴스 데이터를 활용하여 {company_name} 기업의 기업 분석 내용을 제공하세요. 뉴스 기사는 최신 순으로 {num_news}개를 가져오며, 뉴스 제목이 중복되는 경우에는 제외합니다. "
    news_context += "포함할 내용은 다음과 같습니다: \n"
    news_context += "summary, urls" # 필드명 다시 언급
    
    news_result = await Runner.run(starting_agent=news_agent, input=news_context, max_turns=30)
    
    # 3. 결과 처리 및 반환
    # DART 분석 결과 처리
    if not dart_result or not dart_result.final_output:
        company_analysis_data = {
            "company_brand": "기업 브랜드 정보를 가져오지 못했습니다.",
            "company_analysis": "기업 분석 정보를 가져오지 못했습니다.",
            "company_vision": "기업 비전 정보를 가져오지 못했습니다.",
            "company_finance": "기업 재정상황 정보를 가져오지 못했습니다.",
        }
    else:
        # 포맷팅 
        formatted_result = await format_company_analysis(dart_result.final_output)
        
        # 재무 정보 포맷팅
        company_finance = ""
        if base or fin:
            finance_data = []
            
            # base=True인 경우 기본 재무 정보 추가
            if base and hasattr(dart_result.final_output, 'base') and dart_result.final_output.base:
                base_finance = dart_result.final_output.base.model_dump(exclude_none=True)
                if "sales_revenue" in base_finance:
                    finance_data.append(f"매출액: {base_finance['sales_revenue']}")
                if "operating_profit" in base_finance:
                    finance_data.append(f"영업이익: {base_finance['operating_profit']}")
                if "net_income" in base_finance:
                    finance_data.append(f"당기순이익: {base_finance['net_income']}")
                    
            # fin=True인 경우 심화 재무 정보 추가
            if fin and hasattr(dart_result.final_output, 'fin') and dart_result.final_output.fin:
                fin_finance = dart_result.final_output.fin.model_dump(exclude_none=True)
                
                # 재무상태 정보
                if "total_assets" in fin_finance:
                    finance_data.append(f"자산 총계: {fin_finance['total_assets']}")
                if "total_liabilities" in fin_finance:
                    finance_data.append(f"부채 총계: {fin_finance['total_liabilities']}")
                if "total_equity" in fin_finance:
                    finance_data.append(f"자본 총계: {fin_finance['total_equity']}")
                    
                # 현금흐름 정보
                if "operating_cash_flow" in fin_finance:
                    finance_data.append(f"영업활동 현금흐름: {fin_finance['operating_cash_flow']}")
                if "investing_cash_flow" in fin_finance:
                    finance_data.append(f"투자활동 현금흐름: {fin_finance['investing_cash_flow']}")
                if "financing_cash_flow" in fin_finance:
                    finance_data.append(f"재무활동 현금흐름: {fin_finance['financing_cash_flow']}")
                    
            company_finance = "\n".join(finance_data) if finance_data else "재무 정보가 포함되지 않았습니다."

        # 결과 객체 및 속성 접근 시 None 확인 추가
        company_brand = "정보 없음"
        company_vision = "정보 없음"
        if hasattr(dart_result.final_output, 'default') and dart_result.final_output.default:
            company_brand = dart_result.final_output.default.company_brand or "정보 없음"
            company_vision = dart_result.final_output.default.company_vision or "정보 없음"

        company_analysis_data = {
            "company_brand": company_brand,
            "company_analysis": formatted_result,
            "company_vision": company_vision,
            "company_finance": company_finance,
        }
    
    # 뉴스 분석 결과 처리
    if not news_result or not news_result.final_output:
        news_data = {
            "summary": "뉴스 요약 정보를 가져오지 못했습니다.",
            "urls": []
        }
    else:
        news_data = {
            "summary": news_result.final_output.summary or "뉴스 요약 정보가 없습니다.",
            "urls": news_result.final_output.urls or []
        }
    
    # 최종 결과 합치기
    response = {
        **company_analysis_data,
        "news_summary": news_data["summary"],
        "news_urls": news_data["urls"]
    }
    
    return response