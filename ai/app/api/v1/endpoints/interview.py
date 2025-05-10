from fastapi import APIRouter
from app.schemas import interview
from app.services import interview_service

router = APIRouter(prefix="/interview", tags=["interview"])

@router.post("/question/cover-letter")
async def create_interview_question_from_cover_letter(request: interview.CreateQuestionRequest)->interview.CreateQuestionResponse:

    result = await interview_service.create_interview_questions_from_cover_letter(request)
    
    return interview.CreateQuestionResponse(
        cover_letter_id=request.cover_letter.cover_letter_id,
        expected_questions=result
    )

@router.post("/feedback")
async def feedback_interview(request: interview.FeedbackInterviewRequest)->interview.FeedbackInterviewResponse:
    
    result = await interview_service.feedback_interview(request)
    
    return interview.FeedbackInterviewResponse(
        feedbacks=result.feedbacks,
        overall_feedback=result.overall_feedback
    )