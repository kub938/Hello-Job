import logging
from typing import List, Dict
from pydantic import BaseModel, Field

from app.schemas import interview
from app.prompts.interview_prompts import CREATE_INTERVIEW_QUESTION_PROMPT
from app.core.request_queue import get_request_queue
from app.core.openai_utils import get_rate_limiter

logger = logging.getLogger(__name__)

# 아래 클래스 추가: 정확히 n개의 질문을 생성하도록 유도하는 스키마
class ParsingInterviewQuestions(BaseModel):
    """면접 질문 파싱 스키마"""
    questions: List[str] = Field(
        description="자기소개서, 경험, 프로젝트 기반의 면접 예상 질문 목록"
    )

async def parse_user_info(request: interview.CreateQuestionRequest):
    # 요청에서 데이터 추출
    cover_letter_contents = request.cover_letter.cover_letter_contents
    experiences = request.experiences
    projects = request.projects
    
    user_info_coverletter = """
# 자기소개서 

"""
    
    for i, cover_letter_content in enumerate(cover_letter_contents, 1):
        user_info_coverletter += f"## 자기소개서 {cover_letter_content.cover_letter_content_number}\n"
        user_info_coverletter += f"### 질문: \n{cover_letter_content.cover_letter_content_question}\n"
        user_info_coverletter += f"### 내용: \n{cover_letter_content.cover_letter_content_detail}\n\n"
        
    user_info_experiences = """
# 경험

"""
    for i, experience in enumerate(experiences, 1):
        user_info_experiences += f"## 경험 {i}\n"
        user_info_experiences += f"### 제목: {experience.experience_name}\n"
        user_info_experiences += f"### 상세 내용: \n{experience.experience_detail}\n"
        user_info_experiences += f"### 역할: \n{experience.experience_role}\n"
        user_info_experiences += f"### 기간: \n{experience.experience_start_date} ~ {experience.experience_end_date}\n"
        user_info_experiences += f"### 회사: \n{experience.experience_client}\n\n"
        
    user_info_projects = """
# 프로젝트

"""
    for i, project in enumerate(projects, 1):
        user_info_projects += f"## 프로젝트 {i}\n"
        user_info_projects += f"### 제목: {project.project_name}\n"
        user_info_projects += f"### 개요: \n{project.project_intro}\n"
        user_info_projects += f"### 역할: \n{project.project_role}\n"
        user_info_projects += f"### 사용 기술: \n{project.project_skills}\n"
        user_info_projects += f"### 상세 내용: \n{project.project_detail}\n"
        user_info_projects += f"### 기간: \n{project.project_start_date} ~ {project.project_end_date}\n"
        user_info_projects += f"### 기관: \n{project.project_client}\n\n"
        
    user_info = user_info_coverletter + user_info_experiences + user_info_projects
    
    return user_info

        
async def create_interview_questions_from_cover_letter(request: interview.CreateQuestionRequest)->List[str]:
    """자기소개서 기반 면접 예상 질문 생성 서비스 함수입니다."""
    logger.info(f"면접 예상 질문 생성 요청 - 자기소개서 ID: {request.cover_letter.cover_letter_id}")
    
    request_queue = get_request_queue()
    
    system_prompt = CREATE_INTERVIEW_QUESTION_PROMPT
    
    # 사용자 정보 파싱 
    user_info = await parse_user_info(request)
    
    # 생성할 질문 개수 (기본값 10개)
    num_questions = 5
    
    # 사용자 프롬프트에 질문 개수 정보 추가
    user_prompt = f"""다음 정보를 바탕으로 {num_questions}개의 면접 예상 질문을 생성해주세요:
    
{user_info}"""

    async def perform_api_call():
        rate_limiter = get_rate_limiter()
        
        # Structured outputs을 위한 Pydantic 스키마 사용
        # questions 필드에 정확히 num_questions 개수의 항목을 생성하도록 설정
        class CustomParsingInterviewQuestions(ParsingInterviewQuestions):
            questions: List[str] = Field(
                description=f"정확히 {num_questions}개의 면접 예상 질문 목록"
            )
        
        response = await rate_limiter.chat_completion(
            model="gpt-4.1", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format=CustomParsingInterviewQuestions
        )
        
        # API 응답에서 구조화된 데이터로 질문 추출
        interview_questions = response.choices[0].message.parsed.questions
        return interview_questions
    
    interview_questions = await request_queue.enqueue(
        perform_api_call,
        priority=5,  # 우선순위 (낮을수록 우선)
        estimated_tokens=3000
    )
    
    logger.info(f"면접 예상 질문 생성 완료: {interview_questions}")
    
    return interview_questions

async def feedback_interview(request: interview.FeedbackInterviewRequest)->interview.FeedbackInterviewResponse:
    #TODO: 면접 피드백 서비스 함수 구현
    return None