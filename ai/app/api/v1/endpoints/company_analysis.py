from fastapi import APIRouter
from datetime import datetime

from app.schemas import company
from app.services.company_analysis_service import company_analysis_dart, company_analysis_news

router = APIRouter(prefix="/company-analysis", tags=["company-analysis"])


@router.post("/")
async def company_analysis(request: company.CompanyAnalysisRequest):
    """_summary_

    Args:
        request (company.CompanyAnalysisRequest): 기업 분석 요청 정보
    """
    
    company_name = request.company_name
    base = request.base
    plus = request.plus
    fin = request.fin
    
    # TODO: 기업 분석 로직 
    company_analysis_result = await company_analysis_dart(company_name, base, plus, fin)
    news_result = await company_analysis_news(company_name)
    
    # response = company.CompanyAnalysisResponse(
    #     company_name=company_name,
    #     analysis_date=datetime.now().strftime("%Y-%m-%d"),
    #     company_brand=company_analysis_result["company_brand"],
    #     company_analysis=company_analysis_result["company_analysis"],
    #     company_vision=company_analysis_result["company_vision"],
    #     company_news=news_result
    # )
    
    # 
    response = {
        "company_name": company_name,
        "analysis_date": datetime.now().strftime("%Y-%m-%d"),
        
        "company_brand": company_analysis_result["company_brand"],
        "company_analysis": company_analysis_result["company_analysis"],
        "company_vision": company_analysis_result["company_vision"],
        "company_finance": company_analysis_result["company_finance"],
        
        # "news_summary": news_result["summary"],
        # "news_urls": news_result["urls"]
        "news_summary": "더미 뉴스 요약 정보",
        "news_urls": ["더미 뉴스 링크 1", "더미 뉴스 링크 2"]
    }
    return response
