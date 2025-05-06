from fastapi import APIRouter
from app.schemas.cover_letter import CreateCoverLetterRequest, EditCoverLetterRequest, CreateCoverLetterResponse
from app.services.cover_letter_service import create_cover_letter_all


router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])

@router.post("")
async def create_cover_letter(request: CreateCoverLetterRequest):
    """자기소개서 초안을 생성합니다."""
    cover_letters_result = await create_cover_letter_all(request)
    
    return CreateCoverLetterResponse(cover_letters=cover_letters_result)

@router.post("/edit")
async def edit_cover_letter(request: EditCoverLetterRequest):
    """자기소개서 수정 방향을 제시합니다."""
    
    #TODO: 자기소개서 수정 API 엔드포인트 구현
    
    pass 

