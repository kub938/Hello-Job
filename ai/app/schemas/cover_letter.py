from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class CompanyAnalysis(BaseModel):
    """기업 분석 정보"""
    company_name: str
    company_brand: str
    company_analysis: str
    company_vision: str
    company_finance: str
    created_at: str
    news_analysis_data: str

class JobRoleAnalysis(BaseModel):
    """직무 분석 정보"""
    job_role_name: str
    job_role_title: Optional[str] = None
    job_role_work: Optional[str] = None
    job_role_skills: Optional[str] = None
    job_role_requirements: Optional[str] = None
    job_role_preferences: Optional[str] = None
    job_role_etc: Optional[str] = None
    job_role_category: str

class Experience(BaseModel):
    """경험 정보"""
    experience_name: str
    experience_detail: str
    experience_role: Optional[str] = None
    experience_start_date: str
    experience_end_date: str
    experience_client: Optional[str] = None

class Project(BaseModel):
    """프로젝트 정보"""
    project_name: str
    project_intro: str
    project_role: Optional[str] = None
    project_skills: Optional[str] = None
    project_detail: Optional[str] = None
    project_client: Optional[str] = None
    project_start_date: str
    project_end_date: str

class ContentItem(BaseModel):
    """자기소개서 항목 정보"""
    content_number: int  # 자기소개서 항목 번호
    content_question: str  # 자기소개서 항목 질문
    content_length: int  # 자기소개서 항목 글자수 제한
    content_prompt: str  # 자기소개서 사용자 요청 사항
    experiences: List[Experience]  # 경험 정보 리스트 
    projects: List[Project]  # 프로젝트 정보 리스트

class CreateCoverLetterRequest(BaseModel):
    """자기소개서 초안 생성 요청 정보"""
    company_analysis: CompanyAnalysis
    job_role_analysis: JobRoleAnalysis
    contents: List[ContentItem]

class CoverLetterItem(BaseModel):
    """자기소개서 항목 응답"""
    content_number: int
    cover_letter: str

class CreateCoverLetterResponse(BaseModel):
    """자기소개서 응답"""
    cover_letters: List[CoverLetterItem]

class EditCoverLetterRequest(BaseModel):
    """자기소개서 수정 방향 제시 요청 정보"""
    pass 

