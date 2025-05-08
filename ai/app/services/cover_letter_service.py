import os
import json
import hashlib
from dotenv import load_dotenv
from openai import OpenAI
from app.schemas.cover_letter import *
from app.core.openai_utils import get_rate_limiter
from app.core.request_queue import get_request_queue

load_dotenv()

async def create_cover_letter(content: ContentItem, 
                              company_analysis: CompanyAnalysis, 
                              job_role_analysis: JobRoleAnalysis) -> CoverLetterItem:
    
    # 요청 큐 가져오기
    request_queue = get_request_queue()
    
    # 캐시 키 생성
    cache_key = f"cover_letter_{content.content_number}_{hashlib.md5(content.content_question.encode()).hexdigest()}"
    
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
    
    # 실제 OpenAI API 호출을 수행하는 함수
    async def perform_api_call():
        rate_limiter = get_rate_limiter()
        response = await rate_limiter.chat_completion(
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
        return cover_letter
    
    # 요청 큐에 넣고 실행 (캐싱 적용)
    cover_letter = await request_queue.enqueue(
        perform_api_call,
        priority=5,  # 우선순위 (낮을수록 우선)
        estimated_tokens=3000,
        cache_key=cache_key
    )
    
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


async def parse_edit_suggestion(ai_message: EditSuggestionList) -> str:
    #TODO: 수정 제안 파싱
    
    edit_suggestions_str = ""
    for idx, suggestion in enumerate(ai_message.suggestions, 1):
        edit_suggestions_str += f"========== {idx}번째 수정 제안 ==========\n"
        edit_suggestions_str += f"  원본 내용: {suggestion.original_content}\n"
        edit_suggestions_str += f"  수정 이유: {suggestion.edit_reason}\n"
        edit_suggestions_str += f"  수정 제안: {suggestion.edit_suggestion}\n"
        
    return edit_suggestions_str


async def edit_cover_letter_service(request: EditCoverLetterRequest) -> str:
    
    # 요청 큐 가져오기
    request_queue = get_request_queue()
    
    # 캐시 키 생성
    user_msg_hash = hashlib.md5(request.edit_content.user_message.encode()).hexdigest()
    cache_key = f"edit_cover_letter_{request.edit_content.content_number}_{user_msg_hash}"
    
    # 기업 분석 정보
    company_analysis = request.company_analysis
    # 직무 분석 정보
    job_role_analysis = request.job_role_analysis
    # 경험 정보
    experiences = request.experiences
    # 프로젝트 정보
    projects = request.projects
    # 수정할 내용
    edit_content = request.edit_content
    
    # 경험 정보 텍스트 구성
    experiences_text = ""
    for idx, exp in enumerate(experiences, 1):
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
    for idx, proj in enumerate(projects, 1):
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
    다음 정보를 바탕으로 자기소개서 수정 방향을 제시해주세요:
    
    ## 현재 자기소개서 항목
    - 항목 번호: {edit_content.content_number}
    - 항목 질문: {edit_content.content_question}
    - 글자수 제한: {edit_content.content_length}
    - 현재 내용: {edit_content.cover_letter}
    - 수정 요청사항: {edit_content.user_message}
    
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
    
    ## 수정 방향 제시 가이드라인
    1. 사용자의 수정 요청사항을 정확히 반영한 구체적인 수정 방향을 제시해주세요.
    2. 기업의 비전과 분석 내용에 부합하는 방향으로 수정 방향을 제시해주세요.
    3. 직무에 필요한 역량과 스킬을 지원자의 경험/프로젝트와 연결하여 수정 방향을 제시해주세요.
    4. 수정 제안 시 예시 문장을 제시해도 좋습니다. 예시 문장을 작성하는 경우 예시 문장은 정답이 아님을 명시해주세요.
    5. 글자수 제한({edit_content.content_length}자)을 고려한 수정 방향을 제시해주세요.
    6. 항목 질문({edit_content.content_question})에 직접적으로 답하는 방식으로 수정 방향을 제시해주세요.
    7. 한국어로 작성해주세요.
    8. 수정 제안은 다음 JSON 형식으로 작성해주세요:
    [
        {{
            "original_content": "수정이 필요한 원본 자기소개서의 특정 부분",
            "edit_reason": "수정 이유",
            "edit_suggestion": "수정 제안 내용 및 예시 문장"
        }},
        ...
    ]
    
    ## 중요 사항
    - 직접적인 수정은 절대 하지 마세요. 자기소개서의 어떤 부분을 어떤 방향으로 수정하면 좋을지에 대한 제안만 해주세요.
    - "이렇게 써보세요"와 같은 직접적인 텍스트 제시가 아닌, "이런 방향으로 수정하면 좋을 것 같습니다"와 같은 방향성 제시를 해주세요.
    - 각 수정 제안(edit_suggestion)에는 구체적인 문장이 아닌 수정 방향과 고려 사항만 작성해주세요.
    """
    
    # 실제 OpenAI API 호출을 수행하는 함수
    async def perform_api_call():
        rate_limiter = get_rate_limiter()
        response = await rate_limiter.chat_completion(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": "당신은 전문적인 자기소개서 수정 도우미입니다. 기업과 직무 분석을 바탕으로 지원자의 경험과 프로젝트를 잘 활용하여 맞춤형 자기소개서 수정 방향을 제시해주세요. 직접적인 수정은 절대 하지 말고 수정 방향만 제안해주세요. 수정 제안은 반드시 JSON 형식으로 작성해주세요."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        # API 응답 JSON 추출 및 파싱
        suggestion_json = response.choices[0].message.content.strip()
        return suggestion_json
    
    # 요청 큐에 넣고 실행 (캐싱 적용)
    suggestion_json = await request_queue.enqueue(
        perform_api_call,
        priority=5,  # 우선순위 (낮을수록 우선)
        estimated_tokens=3000,
        cache_key=cache_key
    )
    
    # JSON 파싱 및 변환
    edit_suggestions = json.loads(suggestion_json)
    
    # 수정 제안 변환
    suggestions_list = EditSuggestionList(suggestions=[
        EditSuggestion(
            original_content=suggestion.get("original_content", ""),
            edit_reason=suggestion.get("edit_reason", ""),
            edit_suggestion=suggestion.get("edit_suggestion", "")
        )
        for suggestion in edit_suggestions
    ])
    
    # 포맷팅된 결과 반환
    ai_message_str = await parse_edit_suggestion(suggestions_list)
    
    return ai_message_str