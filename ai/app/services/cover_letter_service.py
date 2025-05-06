import os
from dotenv import load_dotenv
from openai import OpenAI
from app.schemas.cover_letter import CreateCoverLetterRequest, CoverLetterItem, ContentItem, CompanyAnalysis, JobRoleAnalysis

load_dotenv()

async def create_cover_letter(content: ContentItem, company_analysis: CompanyAnalysis, job_role_analysis: JobRoleAnalysis) -> CoverLetterItem:
    
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # 경험 정보 텍스트 구성
    experiences_text = ""
    for idx, exp in enumerate(content.experiences, 1):
        experiences_text += f"""
        경험 {idx}:
        - 경험명: {exp.experience_name}
        - 경험 상세: {exp.experience_detail}
        - 역할: {exp.experience_role or '정보 없음'}
        - 기간: {exp.experience_start_date} ~ {exp.experience_end_date}
        - 클라이언트: {exp.experience_client or '정보 없음'}
        """
    
    # 프로젝트 정보 텍스트 구성
    projects_text = ""
    for idx, proj in enumerate(content.projects, 1):
        projects_text += f"""
        프로젝트 {idx}:
        - 프로젝트명: {proj.project_name}
        - 프로젝트 소개: {proj.project_intro}
        - 역할: {proj.project_role or '정보 없음'}
        - 사용 기술: {proj.project_skills or '정보 없음'}
        - 상세 내용: {proj.project_detail or '정보 없음'}
        - 클라이언트: {proj.project_client or '정보 없음'}
        - 기간: {proj.project_start_date} ~ {proj.project_end_date}
        """
    
    # 프롬프트 구성
    prompt = f"""
    다음 정보를 바탕으로 자기소개서 항목에 대한 초안을 작성해주세요:
    
    ## 자기소개서 항목
    - 항목 번호: {content.content_number}
    - 항목 질문: {content.content_question}
    - 글자수 제한: {content.content_length}
    - 요청 사항: {content.content_prompt}
    
    ## 기업 분석
    - 기업명: {company_analysis.company_name}
    - 기업 브랜드: {company_analysis.company_brand}
    - 기업 분석: {company_analysis.company_analysis}
    - 비전: {company_analysis.company_vision}
    - 재무 상태: {company_analysis.company_finance}
    - 뉴스 분석: {company_analysis.news_analysis_data}
    
    ## 직무 분석
    - 직무명: {job_role_analysis.job_role_name}
    - 직무 제목: {job_role_analysis.job_role_title or '정보 없음'}
    - 업무 내용: {job_role_analysis.job_role_work or '정보 없음'}
    - 필요 스킬: {job_role_analysis.job_role_skills or '정보 없음'}
    - 자격 요건: {job_role_analysis.job_role_requirements or '정보 없음'}
    - 우대 사항: {job_role_analysis.job_role_preferences or '정보 없음'}
    - 기타 정보: {job_role_analysis.job_role_etc or '정보 없음'}
    - 직무 카테고리: {job_role_analysis.job_role_category}
    
    ## 지원자 경험 정보
    {experiences_text}
    
    ## 지원자 프로젝트 정보
    {projects_text}
    
    ## 작성 가이드라인
    1. 기업의 비전과 분석 내용에 부합하는 내용으로 작성해주세요.
    2. 직무에 필요한 역량과 스킬을 지원자의 경험/프로젝트와 연결하여 작성해주세요.
    3. 지원자의 경험과 프로젝트 중 해당 직무와 가장 관련성이 높은 내용을 중심으로 작성해주세요.
    4. 지원자가 요청한 사항({content.content_prompt})을 반영해주세요.
    5. {content.content_length}자 내외로 작성해주세요.
    6. 한국어로 작성해주세요.
    7. 항목 질문({content.content_question})에 직접적으로 답하는 방식으로 작성해주세요.
    """
    
    # OpenAI API 호출
    response = client.chat.completions.create(
        model="gpt-4.1", 
        messages=[
            {"role": "system", "content": "당신은 전문적인 자기소개서 작성 도우미입니다. 기업과 직무 분석을 바탕으로 지원자의 경험과 프로젝트를 잘 활용하여 맞춤형 자기소개서를 작성해주세요."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    
    # API 응답에서 자기소개서 내용 추출
    cover_letter = response.choices[0].message.content.strip()
    
    return CoverLetterItem(content_number=content.content_number, cover_letter=cover_letter)


async def create_cover_letter_all(request: CreateCoverLetterRequest) -> list[CoverLetterItem]:  
    
    # 기업 분석 정보
    company_analysis = request.company_analysis
    # 직무 분석 정보
    job_role_analysis = request.job_role_analysis
    # 자기소개서 항목 정보
    contents = request.contents
    
    # 자기소개서 항목 생성
    cover_letters = []
    for content in contents:
        cover_letter = await create_cover_letter(content, company_analysis, job_role_analysis)
        cover_letters.append(cover_letter)
        
    return cover_letters