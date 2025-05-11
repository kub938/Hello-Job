from app.schemas import interview
from typing import List


async def create_interview_questions_from_cover_letter(request: interview.CreateQuestionRequest)->List[str]:
    #TODO: 자기소개서 기반 면접 질문 생성 서비스 함수 구현
    return 

async def feedback_interview(request: interview.FeedbackInterviewRequest)->interview.FeedbackInterviewResponse:
    #TODO: 면접 피드백 서비스 함수 구현
    return 