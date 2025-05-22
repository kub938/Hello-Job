#!/usr/bin/env python3
"""
회사 분석 MCP 서버 (Company Analysis MCP Server)

기업 정보 검색, SWOT 분석, 네이버 검색, 구글 검색 등의 다양한 기능을 제공하는 통합 MCP 서버입니다.
아래 파일들의 기능을 통합:
- dart.py - 금융감독원 기업공시 검색
- swot_analysis.py - 기업 SWOT 분석
- py-mcp-naver-search/server.py - 네이버 검색
- google-search-mcp-server/google_search_mcp_server.py - 구글 검색
"""

# === 공통 라이브러리 임포트 ===
import os
import sys
import json
import httpx
import logging
import traceback
import re
import zipfile
import binascii
import hashlib
from io import BytesIO, StringIO
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple, Set
from dataclasses import dataclass
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
import chardet
from bs4 import BeautifulSoup
import markdownify

# === 네이버/구글 검색 관련 임포트 ===
from pydantic import BaseModel, Field, ValidationError
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# === SWOT 분석 관련 임포트 ===
from colorama import Fore, Style, init

# === MCP 관련 임포트 ===
from mcp.server.fastmcp import FastMCP, Context
from mcp.types import Tool

# === 초기화 설정 ===
# .env 파일 로드 (파일이 없어도 오류 발생 안 함)
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 터미널 색상 지원 초기화 (SWOT 분석용)
init()

# --- API 키 및 설정 ---
# DART API 설정
API_KEY = os.getenv("DART_API_KEY")
BASE_URL = "https://opendart.fss.or.kr/api"

# 네이버 API 설정
NAVER_API_BASE_URL = "https://openapi.naver.com/v1/search/"
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
NAVER_HEADERS = {}

if NAVER_CLIENT_ID and NAVER_CLIENT_SECRET:
    NAVER_HEADERS = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }
else:
    logger.warning("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.")

# 구글 API 설정
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

# MCP 서버 인스턴스 생성
mcp = FastMCP("CompanyAnalysis")
logger.info("Company Analysis MCP Server 초기화 중...")

# ===== SWOT 분석 관련 코드 =====

@dataclass
class SWOTThoughtData:
    """기업 SWOT 분석을 위한 향상된 사고 데이터 구조."""
    thought: str
    thoughtNumber: int
    totalThoughts: int
    nextThoughtNeeded: bool
    analysisStage: str  # 'S', 'W', 'O', 'T', 'synthesis', 'recommendation', 'planning'
    companyName: Optional[str] = None
    jobPosition: Optional[str] = None
    industry: Optional[str] = None
    isRevision: Optional[bool] = None
    revisesThought: Optional[int] = None
    branchFromThought: Optional[int] = None
    branchId: Optional[str] = None
    needsMoreThoughts: Optional[bool] = None
    dataSource: Optional[str] = None  # 정보 출처
    languagePreference: Optional[str] = "ko"  # 언어 설정 (ko: 한국어, en: 영어) 

class EnhancedSWOTServer:
    """향상된 기업 SWOT 분석을 위한 서버 구현."""

    def __init__(self):
        self.thought_history: List[SWOTThoughtData] = []
        self.branches: Dict[str, List[SWOTThoughtData]] = {}
        
        # SWOT 분석 단계 정의
        self.stages = {
            'planning': '📝 계획 수립',
            'S': '💪 강점(Strengths)',
            'W': '🔍 약점(Weaknesses)',
            'O': '🚀 기회(Opportunities)', 
            'T': '⚠️ 위협(Threats)',
            'synthesis': '🔄 종합 분석',
            'recommendation': '✅ 지원 전략'
        }
        
        # 영어 단계명 정의
        self.stages_en = {
            'planning': '📝 Planning',
            'S': '💪 Strengths',
            'W': '🔍 Weaknesses',
            'O': '🚀 Opportunities', 
            'T': '⚠️ Threats',
            'synthesis': '🔄 Synthesis',
            'recommendation': '✅ Strategy'
        }
        
        # 단계별 추천 질문과 체크리스트
        self.stage_prompts = {
            'planning': [
                "분석할 기업과 직무를 명확히 정의했는가?",
                "어떤 정보 출처를 활용할 계획인가?",
                "외부 도구(기업 홈페이지, 뉴스 검색, 재무정보 사이트 등)를 어떻게 활용할 것인가?",
                "분석의 주요 목적은 무엇인가? (면접 준비, 자소서 작성 등)",
                "분석 일정과 단계를 어떻게 계획할 것인가?"
            ],
            'S': [
                "기업의 시장 점유율과 브랜드 가치는 어떠한가?",
                "핵심 제품/서비스의 경쟁 우위 요소는 무엇인가?",
                "기술력, 특허, 지적재산권 현황은 어떠한가?",
                "기업 문화와 인재 관리의 강점은 무엇인가?",
                "재무 상태와 투자 능력은 어떠한가?"
            ],
            'W': [
                "경쟁사 대비 부족한 부분은 무엇인가?",
                "내부 프로세스나 시스템의 비효율성이 있는가?",
                "인력, 기술, 자원의 제한점은 무엇인가?",
                "시장 대응 속도나 혁신 능력에 약점이 있는가?",
                "부정적 평판이나 과거 실패 사례가 있는가?"
            ],
            'O': [
                "시장 성장 가능성과 새로운 트렌드는 무엇인가?",
                "기술 발전으로 인한 새로운 기회는 무엇인가?",
                "경쟁사의 약점을 활용할 수 있는 영역은 무엇인가?",
                "규제 변화, 사회적 변화로 인한 기회는 무엇인가?",
                "신규 시장 진출 가능성은 있는가?"
            ],
            'T': [
                "주요 경쟁사와 경쟁 심화 요인은 무엇인가?",
                "시장 변화와 소비자 니즈 변화는 어떠한가?",
                "신기술이나 대체재로 인한 위협은 무엇인가?",
                "규제, 법적 위협 요소는 무엇인가?",
                "경제, 정치적 리스크 요인은 무엇인가?"
            ],
            'synthesis': [
                "SWOT 요소들 간의 상호작용은 어떠한가?",
                "가장 중요한 통찰은 무엇인가?",
                "기업의 전략적 방향성은 무엇인가?",
                "SO, WO, ST, WT 전략을 어떻게 수립할 수 있는가?"
            ],
            'recommendation': [
                "자신의 강점과 기업 필요성을 어떻게 연결할 수 있는가?",
                "기업 문화 적합성을 어떻게 제시할 것인가?",
                "면접과 자기소개서에서 어떤 차별화 전략을 사용할 것인가?",
                "입사 후 어떻게 기여할 수 있는가?",
                "지원 과정에서 활용할 핵심 포인트는 무엇인가?"
            ]
        }

        # 단계별 템플릿 (양식)
        self.stage_templates = {
            'planning': "분석 목표: {company_name} {position}\n계획 단계: {plan_stage}\n활용 자료: {resources}\n주요 초점: {focus}",
            'S': "S{num}: {strength_title}\n근거: {evidence}\n중요도: {importance}",
            'W': "W{num}: {weakness_title}\n근거: {evidence}\n대응 방안: {counter_measure}",
            'O': "O{num}: {opportunity_title}\n근거: {evidence}\n활용 방안: {leverage}",
            'T': "T{num}: {threat_title}\n근거: {evidence}\n대비 방안: {mitigation}",
            'synthesis': "SO 전략: {so_strategy}\nWO 전략: {wo_strategy}\nST 전략: {st_strategy}\nWT 전략: {wt_strategy}",
            'recommendation': "핵심 차별점: {key_differentiator}\n자소서 포인트: {resume_points}\n면접 답변 전략: {interview_strategy}\n입사 후 기여: {contribution}"
        }

    def visual_length(self, s: str) -> int:
        """문자열의 시각적 길이 계산 (한글/CJK 문자는 너비가 2)"""
        length = 0
        for c in s:
            # 한글, 한자, 일본어, 이모지 등 넓은 문자 처리
            if (0x1100 <= ord(c) <= 0x11FF or  # 한글 자모
                0x3130 <= ord(c) <= 0x318F or  # 한글 호환 자모
                0xAC00 <= ord(c) <= 0xD7AF or  # 한글 음절
                0x4E00 <= ord(c) <= 0x9FFF or  # CJK 통합 한자
                0x3000 <= ord(c) <= 0x303F or  # CJK 기호 및 문장 부호
                0xFF00 <= ord(c) <= 0xFFEF or  # 전각 문자
                0x1F300 <= ord(c) <= 0x1F64F):  # 이모지
                length += 2
            else:
                length += 1
        return length

    def validate_thought_data(self, input_data: Any) -> SWOTThoughtData:
        """입력 사고 데이터 검증."""
        if not isinstance(input_data, dict):
            raise ValueError("입력은 딕셔너리 형태여야 합니다")

        # 필수 필드 확인
        required_fields = ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded", "analysisStage"]
        for field in required_fields:
            if field not in input_data:
                raise ValueError(f"필수 필드가 누락되었습니다: {field}")

        # 타입 검증
        if not isinstance(input_data.get("thought"), str):
            raise ValueError("Invalid thought: must be a string")
        if not isinstance(input_data.get("thoughtNumber"), int):
            raise ValueError("Invalid thoughtNumber: must be an integer")
        if not isinstance(input_data.get("totalThoughts"), int):
            raise ValueError("Invalid totalThoughts: must be an integer")
        if not isinstance(input_data.get("nextThoughtNeeded"), bool):
            raise ValueError("Invalid nextThoughtNeeded: must be a boolean")
        if not isinstance(input_data.get("analysisStage"), str):
            raise ValueError("Invalid analysisStage: must be a string")
        
        # 분석 단계 검증
        if input_data.get("analysisStage") not in self.stages:
            raise ValueError(f"Invalid analysisStage: must be one of {', '.join(self.stages.keys())}")

        # SWOTThoughtData 객체 생성
        return SWOTThoughtData(
            thought=input_data.get("thought"),
            thoughtNumber=input_data.get("thoughtNumber"),
            totalThoughts=input_data.get("totalThoughts"),
            nextThoughtNeeded=input_data.get("nextThoughtNeeded"),
            analysisStage=input_data.get("analysisStage"),
            companyName=input_data.get("companyName"),
            jobPosition=input_data.get("jobPosition"),
            industry=input_data.get("industry"),
            isRevision=input_data.get("isRevision"),
            revisesThought=input_data.get("revisesThought"),
            branchFromThought=input_data.get("branchFromThought"),
            branchId=input_data.get("branchId"),
            needsMoreThoughts=input_data.get("needsMoreThoughts"),
            dataSource=input_data.get("dataSource"),
            languagePreference=input_data.get("languagePreference", "ko")
        )

    def format_thought(self, thought_data: SWOTThoughtData) -> str:
        """SWOT 분석 단계에 맞게 사고 포맷팅."""
        # 언어 설정에 따른 단계 정보 선택
        is_korean = thought_data.languagePreference != "en"
        stages = self.stages if is_korean else self.stages_en
        
        # 고정 박스 너비 설정 (일정한 크기 유지를 위해 - 터미널 너비에 맞춤)
        FIXED_BOX_WIDTH = 70  # 더 작은 값으로 조정하여 대부분의 터미널에 맞도록 함
        
        # 분석 단계에 따른 색상 및 아이콘
        stage_info = stages.get(thought_data.analysisStage, "")
        
        if thought_data.analysisStage == 'S':
            stage_color = Fore.GREEN
        elif thought_data.analysisStage == 'W':
            stage_color = Fore.RED
        elif thought_data.analysisStage == 'O':
            stage_color = Fore.BLUE
        elif thought_data.analysisStage == 'T':
            stage_color = Fore.YELLOW
        elif thought_data.analysisStage == 'synthesis':
            stage_color = Fore.MAGENTA
        elif thought_data.analysisStage == 'recommendation':
            stage_color = Fore.CYAN
        elif thought_data.analysisStage == 'planning':
            stage_color = Fore.WHITE
        else:
            stage_color = Fore.WHITE
            
        # 헤더 구성
        header_parts = []
        
        # 기업명 표시 (최대 길이 제한)
        if thought_data.companyName:
            company_name = thought_data.companyName
            if len(company_name) > 12:
                company_name = company_name[:10] + ".."
            header_parts.append(f"📊 {company_name}")
            
        # 직무 표시 (최대 길이 제한)
        if thought_data.jobPosition:
            job_position = thought_data.jobPosition
            if len(job_position) > 12:
                job_position = job_position[:10] + ".."
            header_parts.append(f"👔 {job_position}")
            
        # 분석 단계 표시
        header_parts.append(f"{stage_color}{stage_info}{Style.RESET_ALL}")
        
        # 생각 번호 표시
        header_parts.append(f"({thought_data.thoughtNumber}/{thought_data.totalThoughts})")
        
        # 수정/분기 정보
        context = ""
        if thought_data.isRevision:
            context = f" ({('생각' if is_korean else 'thought')} {thought_data.revisesThought} {('수정' if is_korean else 'revision')})"
        elif thought_data.branchFromThought:
            branch_text = "생각" if is_korean else "thought"
            from_text = "에서 분기" if is_korean else "branch from"
            id_text = "ID" # 동일
            context = f" ({branch_text} {thought_data.branchFromThought}{from_text}, {id_text}: {thought_data.branchId})"
        
        header = " | ".join(header_parts) + context
        
        # 헤더 길이 계산 (ANSI 색상 코드 제외 및 한글 고려)
        visible_header_len = self.visual_length(header) - (len(stage_color) + len(Style.RESET_ALL))
        
        # 정보 출처 표시
        source_info = ""
        if thought_data.dataSource:
            source_text = "출처" if is_korean else "Source"
            source_info_text = f"📚 {source_text}: {thought_data.dataSource}"
            # 길이 제한
            source_visual_len = self.visual_length(source_info_text)
            if source_visual_len > FIXED_BOX_WIDTH - 6:
                # 한글 고려하여 자르기
                cut_pos = 0
                current_len = 0
                for i, c in enumerate(source_info_text):
                    char_width = 2 if self.visual_length(c) == 2 else 1
                    if current_len + char_width > FIXED_BOX_WIDTH - 9:
                        break
                    current_len += char_width
                    cut_pos = i + 1
                source_info_text = source_info_text[:cut_pos] + "..."
            
            # 오른쪽 여백 고정을 위해 정확한 길이 계산
            padding = max(0, FIXED_BOX_WIDTH - 4 - self.visual_length(source_info_text))
            source_info = f"\n│ {source_info_text}{' ' * padding} │"
        
        # 추천 질문 표시 (현재 단계에 맞는 첫 번째 질문만)
        prompt_info = ""
        if thought_data.analysisStage in self.stage_prompts and self.stage_prompts[thought_data.analysisStage]:
            prompt_text = "추천 질문" if is_korean else "Suggested Question"
            question = self.stage_prompts[thought_data.analysisStage][0]  # 첫 번째 질문만 표시
            prompt_info_text = f"💡 {prompt_text}: {question}"
            
            # 길이 제한
            prompt_visual_len = self.visual_length(prompt_info_text)
            if prompt_visual_len > FIXED_BOX_WIDTH - 6:
                # 한글 고려하여 자르기
                cut_pos = 0
                current_len = 0
                for i, c in enumerate(prompt_info_text):
                    char_width = 2 if self.visual_length(c) == 2 else 1
                    if current_len + char_width > FIXED_BOX_WIDTH - 9:
                        break
                    current_len += char_width
                    cut_pos = i + 1
                prompt_info_text = prompt_info_text[:cut_pos] + "..."
            
            # 오른쪽 여백 고정을 위해 정확한 길이 계산
            padding = max(0, FIXED_BOX_WIDTH - 4 - self.visual_length(prompt_info_text))
            prompt_info = f"\n│ {prompt_info_text}{' ' * padding} │"
        
        # 고정된 테두리 길이 사용
        border = "─" * FIXED_BOX_WIDTH
        
        # 최종 포맷팅된 출력 구성
        formatted_output = f"\n┌{border}┐\n"
        
        # 오른쪽 여백 고정을 위해 정확한 길이 계산
        header_padding = max(0, FIXED_BOX_WIDTH - visible_header_len - 2)
        formatted_output += f"│ {header}{' ' * header_padding}│"
        
        if source_info:
            formatted_output += source_info
        if prompt_info:
            formatted_output += prompt_info
            
        formatted_output += f"\n├{border}┤\n"
        
        # 생각 내용 포맷팅 - 너무 긴 줄은 자르고 여러 줄로 나누기
        thought_lines = []
        for line in thought_data.thought.split('\n'):
            # 빈 줄이면 그대로 추가
            if not line.strip():
                thought_lines.append("")
                continue
                
            # 실제 표시되는 길이 기준으로 자르기
            max_width = FIXED_BOX_WIDTH - 6  # 여유 공간 확보
            
            while self.visual_length(line) > max_width:
                # 적절한 자르기 위치 찾기
                cut_pos = 0
                current_length = 0
                
                for i, c in enumerate(line):
                    char_width = 2 if self.visual_length(c) == 2 else 1
                    if current_length + char_width > max_width:
                        break
                    current_length += char_width
                    cut_pos = i + 1
                
                # 적절한 분할 지점 찾기 (공백 기준)
                space_pos = line[:cut_pos].rfind(' ')
                if space_pos > max_width // 3:  # 충분히 앞쪽에 공백이 있으면 그 위치에서 자름
                    cut_pos = space_pos + 1
                    
                thought_lines.append(line[:cut_pos].rstrip())
                line = line[cut_pos:].lstrip()
            
            if line:  # 남은 내용이 있으면 추가
                thought_lines.append(line)
        
        # 내용 출력 (한글 및 특수문자 고려)
        for line in thought_lines:
            # 시각적 길이 계산
            visual_len = self.visual_length(line)
            # 정확한 패딩 계산
            padding = max(0, FIXED_BOX_WIDTH - 4 - visual_len)
            formatted_output += f"│ {line}{' ' * padding} │\n"
            
        formatted_output += f"└{border}┘"
        
        return formatted_output

    def get_next_stage_hint(self, current_stage: str, is_korean: bool = True) -> Tuple[str, str]:
        """다음 분석 단계 및 힌트 제공."""
        stages_order = ['planning', 'S', 'W', 'O', 'T', 'synthesis', 'recommendation']
        
        try:
            current_index = stages_order.index(current_stage)
            if current_index < len(stages_order) - 1:
                next_stage = stages_order[current_index + 1]
                
                hints = {
                    'planning': "강점(S) 분석을 시작하세요. 기업의 핵심 경쟁력, 시장 위치, 기술력 등을 조사하세요." if is_korean else 
                               "Begin Strengths analysis. Research the company's core competencies, market position, and technical capabilities.",
                    'S': "약점(W) 분석을 시작하세요. 기업의 부족한 점, 개선 필요 영역을 파악하세요." if is_korean else 
                         "Begin Weaknesses analysis. Identify areas where the company lags behind competitors or needs improvement.",
                    'W': "기회(O) 분석을 시작하세요. 기업이 활용할 수 있는 시장 트렌드와 외부 요인을 조사하세요." if is_korean else 
                         "Begin Opportunities analysis. Research market trends and external factors the company could leverage.",
                    'O': "위협(T) 분석을 시작하세요. 기업의 성장을 저해할 수 있는 위험 요소를 파악하세요." if is_korean else 
                         "Begin Threats analysis. Identify potential risks that could hinder the company's growth.",
                    'T': "종합 분석을 시작하세요. SWOT 요소 간 상호작용을 분석하고 SO, WO, ST, WT 전략을 도출하세요." if is_korean else 
                         "Begin Synthesis. Analyze interactions between SWOT elements and derive SO, WO, ST, WT strategies.",
                    'synthesis': "지원 전략을 수립하세요. 분석 결과를 바탕으로 자기소개서 포인트와 면접 답변 전략을 준비하세요." if is_korean else 
                                "Develop your application strategy. Prepare points for your resume and interview based on the analysis."
                }
                
                return next_stage, hints.get(current_stage, "다음 단계로 진행하세요." if is_korean else "Proceed to the next stage.")
            else:
                return "", "모든 분석 단계를 완료했습니다!" if is_korean else "All analysis stages completed!"
        except ValueError:
            return "planning", "계획 수립부터 시작하세요." if is_korean else "Start with the Planning stage."
    
    def process_thought(self, input_data: Any) -> Dict[str, Any]:
        """향상된 SWOT 사고 처리 및 응답 반환."""
        try:
            validated_input = self.validate_thought_data(input_data)
            is_korean = validated_input.languagePreference != "en"

            # 총 생각 수가 현재 생각 번호보다 작으면 업데이트
            if validated_input.thoughtNumber > validated_input.totalThoughts:
                validated_input.totalThoughts = validated_input.thoughtNumber

            # 생각 기록에 추가
            self.thought_history.append(validated_input)

            # 분기 처리
            if validated_input.branchFromThought and validated_input.branchId:
                if validated_input.branchId not in self.branches:
                    self.branches[validated_input.branchId] = []
                self.branches[validated_input.branchId].append(validated_input)

            # 출력 포맷팅
            formatted_thought = self.format_thought(validated_input)
            print(formatted_thought, file=sys.stderr)
            
            # 다음 단계 힌트 계산
            next_stage, next_hint = "", ""
            if validated_input.nextThoughtNeeded:
                next_stage, next_hint = self.get_next_stage_hint(validated_input.analysisStage, is_korean)
            
            # 현재 단계 추천 질문 (최대 3개)
            current_prompts = []
            if validated_input.analysisStage in self.stage_prompts:
                current_prompts = self.stage_prompts[validated_input.analysisStage][:3]  # 최대 3개 질문
            
            # 현재 단계 템플릿
            stage_template = self.stage_templates.get(validated_input.analysisStage, "")

            return {
                "thoughtNumber": validated_input.thoughtNumber,
                "totalThoughts": validated_input.totalThoughts,
                "nextThoughtNeeded": validated_input.nextThoughtNeeded,
                "analysisStage": validated_input.analysisStage,
                "branches": list(self.branches.keys()),
                "thoughtHistoryLength": len(self.thought_history),
                "nextStage": next_stage,
                "nextStageHint": next_hint,
                "currentStagePrompts": current_prompts,
                "stageTemplate": stage_template
            }
        except Exception as e:
            error_msg = f"사고 처리 중 오류 발생: {e}" if is_korean else f"Error processing thought: {e}"
            print(f"{Fore.RED}{error_msg}{Style.RESET_ALL}", file=sys.stderr)
            raise

# SWOT 분석 서버 인스턴스 생성
swot_server = EnhancedSWOTServer()
# logger.info("SWOT 분석 서버 초기화 완료")

# SWOT 분석 설명 문서
ENHANCED_SWOT_DESCRIPTION = """
취업 준비를 위한 기업 SWOT 분석 도구입니다.
이 도구는 체계적이고 단계적인 방법으로 기업을 분석하고 지원 전략을 수립할 수 있도록 도와줍니다.

언제 이 도구를 사용해야 하나요:
- 취업 지원 대상 기업에 대해 철저히 분석하고 싶을 때
- 면접 준비를 위해 기업에 대한 통찰력을 얻고 싶을 때
- 자기소개서나 면접에서 기업 맞춤형 답변을 준비할 때
- 여러 기업 중 어디에 지원할지 결정하기 위한 비교 분석이 필요할 때
- 특정 산업이나 직무에 대한 전략적 이해가 필요할 때

주요 특징:
- 기업의 강점(S), 약점(W), 기회(O), 위협(T)을 체계적으로 분석
- 분석된 정보를 바탕으로 종합적 결론 도출
- 기업 맞춤형 지원 전략 수립
- 다양한 정보 출처를 활용한 분석
- 필요시 이전 분석 단계 수정 가능
- 직무별 특화된 분석 지원

매개변수 설명:
- thought: 현재 분석 단계에서의 생각이나 통찰
- thoughtNumber: 현재 생각 번호 (최소값: 1)
- totalThoughts: 예상되는 총 생각 수 (최소값: 1)
- nextThoughtNeeded: 추가 생각이 필요한지 여부
- analysisStage: 현재 분석 단계 ('S', 'W', 'O', 'T', 'synthesis', 'recommendation')
- companyName: 분석 대상 기업명
- jobPosition: 지원 직무
- industry: 산업 분야
- isRevision: 이전 생각을 수정하는지 여부
- revisesThought: 수정 대상 생각 번호
- branchFromThought: 분기 시작점 생각 번호
- branchId: 분기 식별자
- needsMoreThoughts: 추가 생각이 필요한지 여부
- dataSource: 정보 출처
- languagePreference: 언어 설정 (ko: 한국어, en: 영어)
"""

# ===== DART API 관련 코드 =====

# 특정 런타임 에러 로그 필터링 설정
class IgnoreRuntimeErrorFilter(logging.Filter):
    def filter(self, record):
        # 로그 메시지에 특정 문자열이 포함되어 있고, 예외 정보가 RuntimeError 타입인지 확인
        if 'RuntimeError: Attempted to exit cancel scope in a different task' in record.getMessage() \
           and record.exc_info and isinstance(record.exc_info[1], RuntimeError):
            return False # 이 로그는 필터링 (출력 안 함)
        return True # 다른 로그는 통과

# 기본 로거 가져오기 및 필터 추가
logger.addFilter(IgnoreRuntimeErrorFilter())

async def get_financial_statement_xbrl(rcept_no: str, reprt_code: str) -> str:
    """
    재무제표 원본파일(XBRL)을 다운로드하여 XBRL 텍스트를 반환하는 함수

    Args:
        rcept_no: 공시 접수번호(14자리)
        reprt_code: 보고서 코드 (11011: 사업보고서, 11012: 반기보고서, 11013: 1분기보고서, 11014: 3분기보고서)

    Returns:
        추출된 XBRL 텍스트 내용, 실패 시 오류 메시지 문자열
    """
    url = f"{BASE_URL}/fnlttXbrl.xml?crtfc_key={API_KEY}&rcept_no={rcept_no}&reprt_code={reprt_code}"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)

            if response.status_code != 200:
                return f"API 요청 실패: HTTP 상태 코드 {response.status_code}"
            
            # 응답 데이터 기본 정보 로깅
            content_type = response.headers.get('content-type', '알 수 없음')
            content_length = len(response.content)
            content_md5 = hashlib.md5(response.content).hexdigest()
            
            logger.info(f"DART API 응답 정보: URL={url}, 상태코드={response.status_code}, Content-Type={content_type}, 크기={content_length}바이트, MD5={content_md5}")

            try:
                with zipfile.ZipFile(BytesIO(response.content)) as zip_file:
                    xbrl_content = ""
                    for file_name in zip_file.namelist():
                        if file_name.lower().endswith('.xbrl'):
                            with zip_file.open(file_name) as xbrl_file:
                                # XBRL 파일을 텍스트로 읽기 (UTF-8 시도, 실패 시 EUC-KR)
                                try:
                                    xbrl_content = xbrl_file.read().decode('utf-8')
                                except UnicodeDecodeError:
                                    try:
                                        xbrl_file.seek(0)
                                        xbrl_content = xbrl_file.read().decode('euc-kr')
                                    except UnicodeDecodeError:
                                        xbrl_content = "<인코딩 오류: XBRL 내용을 읽을 수 없습니다>"
                            break 
                    
                    if not xbrl_content:
                        return "ZIP 파일 내에서 XBRL 파일을 찾을 수 없습니다."
                    
                    return xbrl_content

            except zipfile.BadZipFile:
                # 응답이 ZIP 파일 형식이 아닐 경우 (DART API 오류 메시지 등)
                logger.error(f"유효하지 않은 ZIP 파일: URL={url}, Content-Type={content_type}, 크기={content_length}바이트")
                
                # 파일 시작 부분(처음 50~100바이트) 16진수로 덤프하여 로깅
                content_head = response.content[:100]
                hex_dump = binascii.hexlify(content_head).decode('utf-8')
                hex_formatted = ' '.join(hex_dump[i:i+2] for i in range(0, len(hex_dump), 2))
                logger.error(f"유효하지 않은 ZIP 파일 헤더 덤프(100바이트): {hex_formatted}")
                
                try:
                    # 여러 인코딩으로 해석 시도하고 내용 로깅
                    encodings_to_try = ['utf-8', 'euc-kr', 'cp949', 'latin-1']
                    decoded_contents = {}
                    
                    for encoding in encodings_to_try:
                        try:
                            content_preview = response.content[:1000].decode(encoding)
                            content_preview = content_preview.replace('\n', ' ')[:200]  # 줄바꿈 제거, 200자로 제한
                            decoded_contents[encoding] = content_preview
                            logger.info(f"{encoding} 인코딩으로 해석한 내용(일부): {content_preview}")
                        except UnicodeDecodeError:
                            logger.info(f"{encoding} 인코딩으로 해석 실패")
                    
                    # XML 파싱 시도
                    try:
                        error_content = response.content.decode('utf-8')
                        try:
                            root = ET.fromstring(error_content)
                            status = root.findtext('status')
                            message = root.findtext('message')
                            if status and message:
                                logger.info(f"API 응답을 XML로 파싱 성공: status={status}, message={message}")
                                return f"DART API 오류: {status} - {message}"
                            else:
                                return f"유효하지 않은 ZIP 파일이며, 오류 메시지 파싱 실패: {error_content[:200]}"
                        except ET.ParseError as xml_err:
                            logger.error(f"XML 파싱 오류: {xml_err}")
                            return f"유효하지 않은 ZIP 파일이며, XML 파싱 불가: {error_content[:200]}"
                    except UnicodeDecodeError as decode_err:
                        logger.error(f"응답 내용 디코딩 오류: {decode_err}")
                        # 디코딩 실패 시 바이너리 데이터 추가 정보 로깅
                        try:
                            # 파일 시그니처 확인 (처음 4~8바이트)
                            file_sig_hex = binascii.hexlify(response.content[:8]).decode('utf-8')
                            logger.info(f"파일 시그니처(HEX): {file_sig_hex}")
                            
                            # 일반적인 파일 형식들의 시그니처와 비교
                            known_signatures = {
                                "504b0304": "ZIP 파일(정상)",
                                "3c3f786d": "XML 문서",
                                "7b227374": "JSON 문서",
                                "1f8b0800": "GZIP 압축파일",
                                "ffd8ffe0": "JPEG 이미지",
                                "89504e47": "PNG 이미지",
                                "25504446": "PDF 문서"
                            }
                            
                            for sig, desc in known_signatures.items():
                                if file_sig_hex.startswith(sig):
                                    logger.info(f"파일 형식 인식: {desc}")
                            
                            return "다운로드한 파일이 유효한 ZIP 파일이 아닙니다 (바이너리 내용 디버깅 로그 확인)."
                        except Exception as bin_err:
                            logger.error(f"바이너리 데이터 분석 중 오류: {bin_err}")
                            return "다운로드한 파일이 유효한 ZIP 파일이 아닙니다 (내용 확인 불가)."
                
                except Exception as decode_err:
                    logger.error(f"응답 내용 분석 중 오류: {decode_err}")
                    return f"다운로드한 파일 분석 중 오류 발생: {str(decode_err)}"
            
            except Exception as e:
                logger.error(f"ZIP 파일 처리 중 오류: {e}")
                return f"ZIP 파일 처리 중 오류 발생: {str(e)}"

    except httpx.RequestError as e:
        logger.error(f"API 요청 중 네트워크 오류: {e}")
        return f"API 요청 중 네트워크 오류 발생: {str(e)}"
    except Exception as e:
        logger.error(f"XBRL 데이터 처리 중 예상치 못한 오류: {e}")
        return f"XBRL 데이터 처리 중 예상치 못한 오류 발생: {str(e)}"

# 상수 정의
# API 설정
API_KEY = os.getenv("DART_API_KEY")
BASE_URL = "https://opendart.fss.or.kr/api"

# 보고서 코드
REPORT_CODE = {
    "사업보고서": "11011",
    "반기보고서": "11012",
    "1분기보고서": "11013",
    "3분기보고서": "11014"
}

# 재무상태표 항목 리스트 - 확장
BALANCE_SHEET_ITEMS = [
    "유동자산", "비유동자산", "자산총계", 
    "유동부채", "비유동부채", "부채총계", 
    "자본금", "자본잉여금", "이익잉여금", "기타자본항목", "자본총계"
]

# 현금흐름표 항목 리스트
CASH_FLOW_ITEMS = ["영업활동 현금흐름", "투자활동 현금흐름", "재무활동 현금흐름"]

# 보고서 유형별 contextRef 패턴 정의
REPORT_PATTERNS = {
    "연간": "FY",
    "3분기": "TQQ",  # 손익계산서는 TQQ
    "반기": "HYA",
    "1분기": "FQA"
}

# 현금흐름표용 특별 패턴
CASH_FLOW_PATTERNS = {
    "연간": "FY",
    "3분기": "TQA",  # 현금흐름표는 TQA
    "반기": "HYA",
    "1분기": "FQA"
}

# 재무상태표용 특별 패턴
BALANCE_SHEET_PATTERNS = {
    "연간": "FY",
    "3분기": "TQA",  # 재무상태표도 TQA
    "반기": "HYA",
    "1분기": "FQA"
}

# 데이터 무효/오류 상태 표시자
INVALID_VALUE_INDICATORS = {"N/A", "XBRL 파싱 오류", "데이터 추출 오류"}

# 재무제표 유형 정의
STATEMENT_TYPES = {
    "재무상태표": "BS",
    "손익계산서": "IS", 
    "현금흐름표": "CF"
}

# 세부 항목 태그 정의
DETAILED_TAGS = {
    "재무상태표": {
        "유동자산": ["ifrs-full:CurrentAssets"],
        "비유동자산": ["ifrs-full:NoncurrentAssets"],
        "자산총계": ["ifrs-full:Assets"],
        "유동부채": ["ifrs-full:CurrentLiabilities"],
        "비유동부채": ["ifrs-full:NoncurrentLiabilities"],
        "부채총계": ["ifrs-full:Liabilities"],
        "자본금": ["ifrs-full:IssuedCapital"],
        "자본잉여금": ["ifrs-full:SharePremium"],
        "이익잉여금": ["ifrs-full:RetainedEarnings"],
        "기타자본항목": ["dart:ElementsOfOtherStockholdersEquity"],
        "자본총계": ["ifrs-full:Equity"]
    },
    "손익계산서": {
        "매출액": ["ifrs-full:Revenue"],
        "매출원가": ["ifrs-full:CostOfSales"],
        "매출총이익": ["ifrs-full:GrossProfit"],
        "판매비와관리비": ["dart:TotalSellingGeneralAdministrativeExpenses"],
        "영업이익": ["dart:OperatingIncomeLoss"],
        "금융수익": ["ifrs-full:FinanceIncome"],
        "금융비용": ["ifrs-full:FinanceCosts"],
        "법인세비용차감전순이익": ["ifrs-full:ProfitLossBeforeTax"],
        "법인세비용": ["ifrs-full:IncomeTaxExpenseContinuingOperations"],
        "당기순이익": ["ifrs-full:ProfitLoss"],
        "기본주당이익": ["ifrs-full:BasicEarningsLossPerShare"]
    },
    "현금흐름표": {
        "영업활동 현금흐름": ["ifrs-full:CashFlowsFromUsedInOperatingActivities"],
        "영업에서 창출된 현금": ["ifrs-full:CashFlowsFromUsedInOperations"],
        "이자수취": ["ifrs-full:InterestReceivedClassifiedAsOperatingActivities"],
        "이자지급": ["ifrs-full:InterestPaidClassifiedAsOperatingActivities"],
        "배당금수취": ["ifrs-full:DividendsReceivedClassifiedAsOperatingActivities"],
        "법인세납부": ["ifrs-full:IncomeTaxesPaidRefundClassifiedAsOperatingActivities"],
        "투자활동 현금흐름": ["ifrs-full:CashFlowsFromUsedInInvestingActivities"],
        "유형자산의 취득": ["ifrs-full:PurchaseOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities"],
        "무형자산의 취득": ["ifrs-full:PurchaseOfIntangibleAssetsClassifiedAsInvestingActivities"],
        "유형자산의 처분": ["ifrs-full:ProceedsFromSalesOfPropertyPlantAndEquipmentClassifiedAsInvestingActivities"],
        "재무활동 현금흐름": ["ifrs-full:CashFlowsFromUsedInFinancingActivities"],
        "배당금지급": ["ifrs-full:DividendsPaidClassifiedAsFinancingActivities"],
        "현금및현금성자산의순증가": ["ifrs-full:IncreaseDecreaseInCashAndCashEquivalents"],
        "기초현금및현금성자산": ["dart:CashAndCashEquivalentsAtBeginningOfPeriodCf"],
        "기말현금및현금성자산": ["dart:CashAndCashEquivalentsAtEndOfPeriodCf"]
    }
}

chat_guideline = "\n* 제공된 공시정보들은 분기, 반기, 연간이 섞여있을 수 있습니다. \n사용자가 특별히 연간이나 반기데이터만을 원하는게 아니라면, 주어진 데이터를 적당히 가공하여 분기별로 사용자에게 제공하세요."

# === DART API Helper 함수 ===

async def get_corp_code_by_name(corp_name: str) -> Tuple[str, str]:
    """
    회사명으로 회사의 고유번호를 검색하는 함수
    
    Args:
        corp_name: 검색할 회사명
        
    Returns:
        (고유번호, 기업이름) 튜플, 찾지 못한 경우 ("", "")
    """
    url = f"{BASE_URL}/corpCode.xml?crtfc_key={API_KEY}"
    
    logger.info(f"회사 코드 검색 시작: 회사명='{corp_name}', URL={url}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                logger.info(f"DART API 요청 시작: corpCode.xml API 호출 중")
                response = await client.get(url)
                
                logger.info(f"DART API 요청 완료: 응답 상태코드={response}")
                
                # 응답 데이터 기본 정보 로깅
                content_type = response.headers.get('content-type', '알 수 없음')
                content_length = len(response.content)
                content_md5 = hashlib.md5(response.content).hexdigest()
                
                logger.info(f"corpCode API 응답 정보: 상태코드={response.status_code}, Content-Type={content_type}, 크기={content_length}바이트, MD5={content_md5}")
                
                if response.status_code != 200:
                    logger.error(f"corpCode API 요청 실패: HTTP 상태 코드 {response.status_code}")
                    return ("", f"API 요청 실패: HTTP 상태 코드 {response.status_code}")
                
                try:
                    logger.info("ZIP 파일 압축 해제 시도")
                    with zipfile.ZipFile(BytesIO(response.content)) as zip_file:
                        try:
                            file_list = zip_file.namelist()
                            logger.info(f"ZIP 파일 내 파일 목록: {file_list}")
                            
                            if 'CORPCODE.xml' not in file_list:
                                logger.error("ZIP 파일 내에 CORPCODE.xml이 없습니다")
                                return ("", "ZIP 파일 내에 CORPCODE.xml이 없습니다")
                            
                            logger.info("CORPCODE.xml 파일 열기 시도")
                            with zip_file.open('CORPCODE.xml') as xml_file:
                                try:
                                    logger.info("XML 파싱 시도")
                                    tree = ET.parse(xml_file)
                                    root = tree.getroot()
                                    
                                    # XML 기본 정보 로깅
                                    company_count = len(root.findall('.//list'))
                                    logger.info(f"전체 회사 목록 수: {company_count}개")
                                    
                                    # 검색어를 포함하는 모든 회사 찾기
                                    logger.info(f"'{corp_name}' 검색어로 회사 검색 시작")
                                    matches = []
                                    match_count = 0
                                    for company in root.findall('.//list'):
                                        name = company.find('corp_name').text
                                        stock_code = company.find('stock_code').text
                                        
                                        # stock_code가 비어있거나 공백만 있는 경우 건너뛰기
                                        if not stock_code or stock_code.strip() == "":
                                            continue
                                            
                                        if name and corp_name in name:
                                            match_count += 1
                                            # 일치도 점수 계산 (낮을수록 더 정확히 일치)
                                            score = 0
                                            if name != corp_name:
                                                score += abs(len(name) - len(corp_name))
                                                if not name.startswith(corp_name):
                                                    score += 10
                                            
                                            code = company.find('corp_code').text
                                            matches.append((name, code, score))
                                            
                                            if match_count <= 5:  # 처음 5개 회사만 로깅
                                                logger.info(f"검색 결과 후보: 이름='{name}', 코드={code}, 주식코드={stock_code}, 일치도점수={score}")
                                    
                                    # 검색 결과 요약 로깅
                                    logger.info(f"총 {match_count}개 회사가 '{corp_name}' 검색어와 일치")
                                    
                                    # 일치하는 회사가 없는 경우
                                    if not matches:
                                        logger.warning(f"'{corp_name}' 회사를 찾을 수 없습니다.")
                                        return ("", f"'{corp_name}' 회사를 찾을 수 없습니다.")
                                    
                                    # 일치도 점수가 가장 낮은 (가장 일치하는) 회사 반환
                                    matches.sort(key=lambda x: x[2])
                                    matched_name = matches[0][0]
                                    matched_code = matches[0][1]
                                    logger.info(f"가장 일치하는 회사 선택: 이름='{matched_name}', 코드={matched_code}")
                                    return (matched_code, matched_name)
                                except ET.ParseError as e:
                                    logger.error(f"XML 파싱 오류: {str(e)}")
                                    return ("", f"XML 파싱 오류: {str(e)}")
                        except Exception as e:
                            logger.error(f"ZIP 파일 내부 파일 접근 오류: {str(e)}")
                            return ("", f"ZIP 파일 내부 파일 접근 오류: {str(e)}")
                except zipfile.BadZipFile:
                    logger.error(f"유효하지 않은 ZIP 파일: URL={url}, Content-Type={content_type}, 크기={content_length}바이트")
                    
                    # 파일 시작 부분(처음 50~100바이트) 16진수로 덤프하여 로깅
                    content_head = response.content[:100]
                    hex_dump = binascii.hexlify(content_head).decode('utf-8')
                    hex_formatted = ' '.join(hex_dump[i:i+2] for i in range(0, len(hex_dump), 2))
                    logger.error(f"유효하지 않은 ZIP 파일 헤더 덤프(100바이트): {hex_formatted}")
                    
                    return ("", "다운로드한 파일이 유효한 ZIP 파일이 아닙니다.")
                except Exception as e:
                    logger.error(f"ZIP 파일 처리 중 오류 발생: {str(e)}")
                    return ("", f"ZIP 파일 처리 중 오류 발생: {str(e)}")
            except httpx.RequestError as e:
                logger.error(f"API 요청 중 네트워크 오류 발생: {str(e)}")
                return ("", f"API 요청 중 네트워크 오류 발생: {str(e)}")
    except Exception as e:
        logger.error(f"회사 코드 조회 중 예상치 못한 오류 발생: {str(e)}, 스택트레이스: {traceback.format_exc()}")
        return ("", f"회사 코드 조회 중 예상치 못한 오류 발생: {str(e)}")


async def get_disclosure_list(corp_code: str, start_date: str, end_date: str) -> Tuple[List[Dict[str, Any]], Optional[str]]:
    """
    기업의 정기공시 목록을 조회하는 함수
    
    Args:
        corp_code: 회사 고유번호(8자리)
        start_date: 시작일(YYYYMMDD)
        end_date: 종료일(YYYYMMDD)
    
    Returns:
        (공시 목록 리스트, 오류 메시지) 튜플. 성공 시 (목록, None), 실패 시 (빈 리스트, 오류 메시지)
    """
    # 정기공시(A) 유형만 조회
    url = f"{BASE_URL}/list.json?crtfc_key={API_KEY}&corp_code={corp_code}&bgn_de={start_date}&end_de={end_date}&pblntf_ty=A&page_count=100"
    
    logger.info(f"공시 목록 조회 시작: 회사코드={corp_code}, 시작일={start_date}, 종료일={end_date}")
    logger.info(f"공시 목록 API URL: {url}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                logger.info("DART 공시 목록 API 요청 시작")
                response = await client.get(url)
                
                # 응답 데이터 기본 정보 로깅
                content_type = response.headers.get('content-type', '알 수 없음')
                content_length = len(response.content)
                
                logger.info(f"공시 목록 API 응답 정보: 상태코드={response.status_code}, Content-Type={content_type}, 크기={content_length}바이트")
                
                if response.status_code != 200:
                    logger.error(f"공시 목록 API 요청 실패: HTTP 상태 코드 {response.status_code}")
                    return [], f"API 요청 실패: HTTP 상태 코드 {response.status_code}"
                
                try:
                    logger.info("JSON 응답 파싱 시도")
                    result = response.json()
                    
                    status = result.get('status')
                    msg = result.get('message', '메시지 없음')
                    
                    if status != '000':
                        logger.error(f"DART API 오류 응답: status={status}, message={msg}")
                        return [], f"DART API 오류: {status} - {msg}"
                    
                    # 정상 응답 처리
                    disclosure_list = result.get('list', [])
                    disclosure_count = len(disclosure_list)
                    
                    if disclosure_count > 0:
                        logger.info(f"공시 목록 조회 성공: {disclosure_count}개 공시 발견")
                        # 첫 5개 공시만 로깅
                        for i, disclosure in enumerate(disclosure_list[:5]):
                            report_nm = disclosure.get('report_nm', '제목 없음')
                            rcept_dt = disclosure.get('rcept_dt', '날짜 없음')
                            rcept_no = disclosure.get('rcept_no', '번호 없음')
                            logger.info(f"공시 {i+1}: 제목='{report_nm}', 접수일={rcept_dt}, 접수번호={rcept_no}")
                    else:
                        logger.warning(f"공시 목록이 비어 있음: 회사코드={corp_code}, 기간={start_date}~{end_date}")
                    
                    return disclosure_list, None
                    
                except ValueError as e:
                    logger.error(f"JSON 파싱 오류: {str(e)}")
                    
                    # 응답 내용 일부 로깅 (JSON이 아닐 경우)
                    try:
                        content_preview = response.content[:500].decode('utf-8')
                        logger.error(f"JSON이 아닌 응답 내용(일부): {content_preview}")
                    except UnicodeDecodeError:
                        logger.error("응답 내용을 UTF-8로 디코딩할 수 없음 (바이너리 데이터)")
                        
                    return [], f"응답 JSON 파싱 오류: {str(e)}"
                except Exception as e:
                    logger.error(f"응답 처리 중 오류: {str(e)}")
                    return [], f"응답 JSON 파싱 오류: {str(e)}"
                    
            except httpx.RequestError as e:
                logger.error(f"공시 목록 API 요청 중 네트워크 오류: {str(e)}")
                return [], f"API 요청 중 네트워크 오류 발생: {str(e)}"
    except Exception as e:
        logger.error(f"공시 목록 조회 중 예상치 못한 오류: {str(e)}, 스택트레이스: {traceback.format_exc()}")
        return [], f"공시 목록 조회 중 예상치 못한 오류 발생: {str(e)}"
    
    logger.error("get_disclosure_list 함수가 예상치 못하게 종료됨")
    return [], "알 수 없는 오류로 공시 목록을 조회할 수 없습니다."

# ===== 네이버 검색 API 관련 코드 =====

# 네이버 API 설정
NAVER_API_BASE_URL = "https://openapi.naver.com/v1/search/"
NAVER_CLIENT_ID = os.environ.get("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.environ.get("NAVER_CLIENT_SECRET")
NAVER_HEADERS = {}

if NAVER_CLIENT_ID and NAVER_CLIENT_SECRET:
    NAVER_HEADERS = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }
else:
    logger.warning("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.")

# Pydantic 모델 정의
class BaseItem(BaseModel):
    title: Optional[str] = None
    link: Optional[str] = None

    class Config:
        extra = "ignore"

class DescriptionItem(BaseItem):
    description: Optional[str] = None

class BlogItem(DescriptionItem):
    bloggername: Optional[str] = None
    bloggerlink: Optional[str] = None
    postdate: Optional[str] = None

class NewsItem(DescriptionItem):
    originallink: Optional[str] = None
    pubDate: Optional[str] = None

class CafeArticleItem(DescriptionItem):
    cafename: Optional[str] = None
    cafeurl: Optional[str] = None

class KinItem(DescriptionItem):
    pass

WebkrItem = DescriptionItem
DocItem = DescriptionItem

class BookItem(BaseItem):
    image: Optional[str] = None
    author: Optional[str] = None
    price: Optional[str] = None
    discount: Optional[str] = None
    publisher: Optional[str] = None
    pubdate: Optional[str] = None
    isbn: Optional[str] = None
    description: Optional[str] = None

class ShopItem(BaseItem):
    image: Optional[str] = None
    lprice: Optional[str] = None
    hprice: Optional[str] = None
    mallName: Optional[str] = None
    productId: Optional[str] = None
    productType: Optional[str] = None
    maker: Optional[str] = None
    brand: Optional[str] = None
    category1: Optional[str] = None
    category2: Optional[str] = None
    category3: Optional[str] = None
    category4: Optional[str] = None

class ImageItem(BaseItem):
    thumbnail: Optional[str] = None
    sizeheight: Optional[str] = None
    sizewidth: Optional[str] = None

class LocalItem(BaseItem):
    category: Optional[str] = None
    description: Optional[str] = None
    telephone: Optional[str] = None
    address: Optional[str] = None
    roadAddress: Optional[str] = None
    mapx: Optional[str] = None
    mapy: Optional[str] = None

class EncycItem(BaseItem):
    thumbnail: Optional[str] = None
    description: Optional[str] = None

# 단일 결과 API 모델
class AdultResult(BaseModel): adult: str
class ErrataResult(BaseModel): errata: str

# 검색 결과 공통 구조
class SearchResultBase(BaseModel):
    lastBuildDate: Optional[str] = None
    total: int = 0
    start: int = 1
    display: int = 10
    items: List[Any] = [] # 기본값 빈 리스트

# 각 API별 최종 응답 모델 정의
class BlogResult(SearchResultBase): items: List[BlogItem]
class NewsResult(SearchResultBase): items: List[NewsItem]
class CafeArticleResult(SearchResultBase): items: List[CafeArticleItem]
class KinResult(SearchResultBase): items: List[KinItem]
class WebkrResult(SearchResultBase): items: List[WebkrItem]
class DocResult(SearchResultBase): items: List[DocItem]
class BookResult(SearchResultBase): items: List[BookItem]
class ShopResult(SearchResultBase): items: List[ShopItem]
class ImageResult(SearchResultBase): items: List[ImageItem]
class LocalResult(SearchResultBase): items: List[LocalItem]
class EncycResult(SearchResultBase): items: List[EncycItem]

# 오류 응답 모델
class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None
    status_code: Optional[int] = None

# 네이버 API 호출 공통 함수
async def _make_naver_api_call(
    endpoint: str,
    params: Dict[str, Any],
    result_model: BaseModel,
    search_type_name: str # 동적 프롬프트 생성을 위한 검색 타입 이름 추가
) -> str:
    """
    Calls the Naver search API and parses the result, returning the result in text format.
    """
    if not NAVER_HEADERS:
        logger.error("네이버 API 인증 정보가 설정되지 않았습니다.")
        error_resp = ErrorResponse(error="인증 정보 미설정", details="NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경 변수를 확인하세요.")
        return "오류 발생:\n" + f"오류: {error_resp.error}\n세부사항: {error_resp.details}"

    url = f"{NAVER_API_BASE_URL}{endpoint}"
    prompt_string = "처리 중 오류 발생:" # 기본 오류 프롬프트

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            logger.info(f"네이버 API 호출 시작 - URL: {url}, Params: {params}")
            response = await client.get(url, headers=NAVER_HEADERS, params=params)
            response.raise_for_status() # HTTP 오류 시 예외 발생

            data = response.json()
            logger.info(f"API 응답 성공 (상태 코드: {response.status_code})")

            try:
                # Pydantic 모델로 파싱 및 유효성 검사
                result = result_model.model_validate(data)
                logger.info(f"데이터 파싱 성공 (모델: {result_model.__name__})")

                # 동적 Prompt 생성 (SearchResultBase 상속 모델인 경우)
                if isinstance(result, SearchResultBase):
                    start_index = result.start
                    end_index = result.start + len(result.items) - 1
                    prompt_string = f"네이버 {search_type_name} 검색 결과 (총 {result.total:,}건 중 {start_index}~{end_index}번째):"
                    
                    # 결과를 구조화된 텍스트 형식으로 변환
                    text_result = f"{prompt_string}\n\n"
                    
                    # 결과 항목 형식화
                    for i, item in enumerate(result.items, 1):
                        text_result += f"### 결과 {i}\n"
                        
                        # 일반적인 항목 처리 (대부분의 모델에 공통)
                        if hasattr(item, 'title'):
                            # HTML 태그 제거
                            title = item.title.replace('<b>', '').replace('</b>', '')
                            text_result += f"제목(title): {title}\n"
                        
                        if hasattr(item, 'link'):
                            text_result += f"링크(link): {item.link}\n"
                        
                        if hasattr(item, 'description') and item.description:
                            # HTML 태그 제거
                            desc = item.description.replace('<b>', '').replace('</b>', '')
                            text_result += f"설명(description): {desc}\n"
                        
                        # 모델별 특수 필드 처리
                        if isinstance(item, BlogItem):
                            text_result += f"블로거명(bloggername): {item.bloggername}\n"
                            text_result += f"블로그 링크(bloggerlink): {item.bloggerlink}\n"
                            if item.postdate:
                                text_result += f"작성일(postdate): {item.postdate}\n"
                        
                        elif isinstance(item, NewsItem):
                            if item.originallink:
                                text_result += f"원본 링크(originallink): {item.originallink}\n"
                            if item.pubDate:
                                text_result += f"발행일(pubDate): {item.pubDate}\n"
                        
                        elif isinstance(item, BookItem) or isinstance(item, ShopItem):
                            if hasattr(item, 'image') and item.image:
                                text_result += f"이미지(image): {item.image}\n"
                            if hasattr(item, 'author') and item.author:
                                text_result += f"저자(author): {item.author}\n"
                            if hasattr(item, 'price') and item.price:
                                text_result += f"가격(price): {item.price}\n"
                            if hasattr(item, 'discount') and item.discount:
                                text_result += f"할인가(discount): {item.discount}\n"
                            if hasattr(item, 'publisher') and item.publisher:
                                text_result += f"출판사(publisher): {item.publisher}\n"
                            if hasattr(item, 'pubdate') and item.pubdate:
                                text_result += f"출판일(pubdate): {item.pubdate}\n"
                            if hasattr(item, 'isbn') and item.isbn:
                                text_result += f"ISBN(isbn): {item.isbn}\n"
                                
                        elif isinstance(item, ShopItem):
                            if hasattr(item, 'image') and item.image:
                                text_result += f"이미지(image): {item.image}\n"
                            if hasattr(item, 'lprice') and item.lprice:
                                text_result += f"최저가(lprice): {item.lprice}\n"
                            if hasattr(item, 'hprice') and item.hprice:
                                text_result += f"최고가(hprice): {item.hprice}\n"
                            if hasattr(item, 'mallName') and item.mallName:
                                text_result += f"쇼핑몰명(mallName): {item.mallName}\n"
                            if hasattr(item, 'brand') and item.brand:
                                text_result += f"브랜드(brand): {item.brand}\n"
                            if hasattr(item, 'maker') and item.maker:
                                text_result += f"제조사(maker): {item.maker}\n"
                            if hasattr(item, 'category1') and item.category1:
                                text_result += f"카테고리1(category1): {item.category1}\n"
                            if hasattr(item, 'category2') and item.category2:
                                text_result += f"카테고리2(category2): {item.category2}\n"
                            if hasattr(item, 'category3') and item.category3:
                                text_result += f"카테고리3(category3): {item.category3}\n"
                            if hasattr(item, 'category4') and item.category4:
                                text_result += f"카테고리4(category4): {item.category4}\n"
                                
                        elif isinstance(item, LocalItem):
                            if item.category:
                                text_result += f"카테고리(category): {item.category}\n"
                            if item.telephone:
                                text_result += f"전화번호(telephone): {item.telephone}\n"
                            if item.address:
                                text_result += f"주소(address): {item.address}\n"
                            if item.roadAddress:
                                text_result += f"도로명주소(roadAddress): {item.roadAddress}\n"
                            if item.mapx:
                                text_result += f"지도 X좌표(mapx): {item.mapx}\n"
                            if item.mapy:
                                text_result += f"지도 Y좌표(mapy): {item.mapy}\n"
                        
                        elif isinstance(item, ImageItem):
                            if item.thumbnail:
                                text_result += f"썸네일(thumbnail): {item.thumbnail}\n"
                            if item.sizeheight:
                                text_result += f"높이(sizeheight): {item.sizeheight}\n"
                            if item.sizewidth:
                                text_result += f"너비(sizewidth): {item.sizewidth}\n"
                        
                        elif isinstance(item, EncycItem):
                            if item.thumbnail:
                                text_result += f"썸네일(thumbnail): {item.thumbnail}\n"
                                
                        elif isinstance(item, CafeArticleItem):
                            if item.cafename:
                                text_result += f"카페명(cafename): {item.cafename}\n"
                            if item.cafeurl:
                                text_result += f"카페 링크(cafeurl): {item.cafeurl}\n"
                                
                        text_result += "\n"
                    
                    return text_result
                
                elif isinstance(result, AdultResult):
                    prompt_string = f"네이버 {search_type_name} 확인 결과:"
                    if result.adult == 0:
                        return f"{prompt_string} 일반 검색어"
                    else:
                        return f"{prompt_string} 성인 검색어"
                
                elif isinstance(result, ErrataResult):
                    print(f"ErrataResult: {result}")
                    prompt_string = f"네이버 {search_type_name} 확인 결과:"
                    if result.errata == "":
                        return f"{prompt_string} 오타 없음"
                    else:
                        return f"{prompt_string} {result.errata}"
                
                else: # 예상치 못한 결과 타입
                    prompt_string = f"네이버 {search_type_name} 처리 결과:"
                    # 결과를 JSON 형식의 문자열로 변환
                    result_json = json.dumps(result.model_dump(), ensure_ascii=False)
                    return f"{prompt_string}\n{result_json}"

            except ValidationError as e:
                logger.error(f"Pydantic 유효성 검사 오류: {e}")
                error_resp = ErrorResponse(error="응답 데이터 형식 오류", details=str(e))
                return f"{prompt_string}\n오류: {error_resp.error}\n세부사항: {error_resp.details}"

    except httpx.HTTPStatusError as e:
        logger.error(f"API HTTP 상태 오류: {e.response.status_code} - {e.response.text}", exc_info=True)
        error_resp = ErrorResponse(
            error=f"API 오류 ({e.response.status_code})",
            details=e.response.text,
            status_code=e.response.status_code
        )
        return f"{prompt_string}\n오류: {error_resp.error}\n세부사항: {error_resp.details}"
    except httpx.RequestError as e:
        logger.error(f"네트워크 요청 오류: {e}", exc_info=True)
        error_resp = ErrorResponse(error="네트워크 오류", details=f"네이버 API 서버 연결 실패: {e}")
        return f"{prompt_string}\n오류: {error_resp.error}\n세부사항: {error_resp.details}"
    except Exception as e:
        logger.exception(f"예상치 못한 오류 발생: {e}") # exc_info=True와 동일
        error_resp = ErrorResponse(error="서버 내부 오류", details=str(e))
        return f"{prompt_string}\n오류: {error_resp.error}\n세부사항: {error_resp.details}"

# 페이지 계산 함수
def calculate_start(page: int, display: int) -> int:
    """Calculates the start value for the API call based on the page number and display count."""
    if page < 1:
        page = 1
    start = (page - 1) * display + 1
    # 네이버 API의 start 최대값(1000) 제한 고려
    return min(start, 1000)

# ===== 구글 검색 API 관련 코드 =====

# 구글 API 설정
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.getenv('GOOGLE_CSE_ID')

if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
    logger.warning("GOOGLE_API_KEY 또는 GOOGLE_CSE_ID 환경 변수가 설정되지 않았습니다.")

# 구글 API 유효성 확인
GOOGLE_SEARCH_AVAILABLE = True
try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    GOOGLE_SEARCH_AVAILABLE = False
    logger.warning("구글 검색 API를 위한 패키지가 설치되지 않았습니다. 'pip install google-api-python-client'를 실행하세요.")

# ===== MCP Tool 정의 =====

# --- DART API 관련 도구 ---
@mcp.tool()
async def search_disclosure(
    company_name: str, 
    start_date: str, 
    end_date: str, 
    ctx: Context,
    requested_items: Optional[List[str]] = None,
) -> str:
    """
    회사의 주요 재무 정보를 검색하여 제공하는 도구.
    requested_items가 주어지면 해당 항목 관련 데이터가 있는 공시만 필터링합니다.
    
    Args:
        company_name: 회사명 (예: 삼성전자, 네이버 등)
        start_date: 시작일 (YYYYMMDD 형식, 예: 20250101)
        end_date: 종료일 (YYYYMMDD 형식, 예: 20251231)
        ctx: MCP Context 객체
        requested_items: 사용자가 요청한 재무 항목 이름 리스트 (예: ["매출액", "영업이익"]). None이면 모든 주요 항목을 대상으로 함. 사용 가능한 항목: 매출액, 영업이익, 당기순이익, 영업활동 현금흐름, 투자활동 현금흐름, 재무활동 현금흐름, 자산총계, 부채총계, 자본총계
        
    Returns:
        검색된 각 공시의 주요 재무 정보 요약 텍스트 (요청 항목 관련 데이터가 있는 경우만)
    """
    # 결과 문자열 초기화
    result = ""
    
    try:
        # 진행 상황 알림
        info_msg = f"{company_name}의"
        if requested_items:
            info_msg += f" {', '.join(requested_items)} 관련"
        info_msg += " 재무 정보를 검색합니다."
        await ctx.info(info_msg) # await 추가
        
        # end_date 조정
        original_end_date = end_date
        adjusted_end_date, was_adjusted = adjust_end_date(end_date)
        
        if was_adjusted:
            await ctx.info(f"공시 제출 기간을 고려하여 검색 종료일을 {original_end_date}에서 {adjusted_end_date}로 자동 조정했습니다.") # await 추가
            end_date = adjusted_end_date
        
        # 회사 코드 조회
        corp_code, matched_name = await get_corp_code_by_name(company_name)
        if not corp_code:
            return f"회사 검색 오류: {matched_name}"
        
        await ctx.info(f"{matched_name}(고유번호: {corp_code})의 공시를 검색합니다.") # await 추가
        
        # 공시 목록 조회
        disclosures, error_msg = await get_disclosure_list(corp_code, start_date, end_date)
        if error_msg:
            return f"공시 목록 조회 오류: {error_msg}"
            
        if not disclosures:
            date_range_msg = f"{start_date}부터 {end_date}까지"
            if was_adjusted:
                date_range_msg += f" (원래 요청: {start_date}~{original_end_date}, 공시 제출 기간 고려하여 확장)"
            return f"{date_range_msg} '{matched_name}'(고유번호: {corp_code})의 정기공시가 없습니다."
        
        await ctx.info(f"{len(disclosures)}개의 정기공시를 찾았습니다. XBRL 데이터 조회 및 분석을 시도합니다.") # await 추가

        # 추출할 재무 항목 및 가능한 태그 리스트 정의
        all_items_and_tags = {
            "매출액": ["ifrs-full:Revenue"],
            "영업이익": ["dart:OperatingIncomeLoss"],
            "당기순이익": ["ifrs-full:ProfitLoss"],
            "영업활동 현금흐름": ["ifrs-full:CashFlowsFromUsedInOperatingActivities"],
            "투자활동 현금흐름": ["ifrs-full:CashFlowsFromUsedInInvestingActivities"],
            "재무활동 현금흐름": ["ifrs-full:CashFlowsFromUsedInFinancingActivities"],
            "자산총계": ["ifrs-full:Assets"],
            "부채총계": ["ifrs-full:Liabilities"],
            "자본총계": ["ifrs-full:Equity"]
        }

        # 사용자가 요청한 항목만 추출하도록 구성
        if requested_items:
            items_to_extract = {item: tags for item, tags in all_items_and_tags.items() if item in requested_items}
            if not items_to_extract:
                 unsupported_items = [item for item in requested_items if item not in all_items_and_tags]
                 return f"요청하신 항목 중 지원되지 않는 항목이 있습니다: {', '.join(unsupported_items)}. 지원 항목: {', '.join(all_items_and_tags.keys())}"
        else:
            items_to_extract = all_items_and_tags
        
        # 결과 문자열 초기화
        result = f"# {matched_name} 주요 재무 정보 ({start_date} ~ {end_date})\n"
        if requested_items: 
            result += f"({', '.join(requested_items)} 관련)\n"
        result += "\n"
        
        # 최대 5개의 공시만 처리 (API 호출 제한 및 시간 고려)
        disclosure_count = min(5, len(disclosures))
        processed_count = 0
        relevant_reports_found = 0
        api_errors = []
        
        # 각 공시별 처리
        for disclosure in disclosures[:disclosure_count]:
            report_name = disclosure.get('report_nm', '제목 없음')
            rcept_dt = disclosure.get('rcept_dt', '날짜 없음')
            rcept_no = disclosure.get('rcept_no', '')

            # 보고서 코드 결정
            reprt_code = determine_report_code(report_name)
            if not rcept_no or not reprt_code:
                continue

            # 진행 상황 보고
            processed_count += 1
            await ctx.report_progress(processed_count, disclosure_count) 
            
            await ctx.info(f"공시 {processed_count}/{disclosure_count} 분석 중: {report_name} (접수번호: {rcept_no})") # await 추가
            
            # XBRL 데이터 조회
            try:
                xbrl_text = await get_financial_statement_xbrl(rcept_no, reprt_code)
                
                # XBRL 파싱 및 데이터 추출
                financial_data = {}
                parse_error = None
                
                if not xbrl_text.startswith(("DART API 오류:", "API 요청 실패:", "ZIP 파일", "<인코딩 오류:")):
                     try:
                         financial_data = parse_xbrl_financial_data(xbrl_text, items_to_extract)
                     except Exception as e:
                         parse_error = e
                         ctx.warning(f"XBRL 파싱/분석 중 오류 발생 ({report_name}): {e}")
                         financial_data = {key: "분석 중 예외 발생" for key in items_to_extract}
                elif xbrl_text.startswith("DART API 오류: 013"):
                    financial_data = {key: "데이터 없음(API 013)" for key in items_to_extract}
                else:
                    error_summary = xbrl_text.split('\n')[0][:100]
                    financial_data = {key: f"오류({error_summary})" for key in items_to_extract}
                    api_errors.append(f"{report_name}: {error_summary}")
                    await ctx.warning(f"XBRL 데이터 조회 오류 ({report_name}): {error_summary}") # ctx.warning에도 await 추가 (만약 비동기라면)

                # 요청된 항목 관련 데이터가 있는지 확인
                is_relevant = True
                if requested_items:
                    is_relevant = any(
                        item in financial_data and 
                        financial_data[item] not in INVALID_VALUE_INDICATORS and 
                        not financial_data[item].startswith("오류(") and
                        not financial_data[item].startswith("분석 중")
                        for item in requested_items
                    )

                # 관련 데이터가 있는 공시만 결과에 추가
                if is_relevant:
                    relevant_reports_found += 1
                    result += f"## {report_name} ({rcept_dt})\n"
                    result += f"접수번호: {rcept_no}\n\n"
                    
                    if financial_data:
                        for item, value in financial_data.items():
                             result += f"- {item}: {value}\n"
                    elif parse_error:
                         result += f"- XBRL 분석 중 오류 발생: {parse_error}\n"
                    else:
                         result += "- 주요 재무 정보를 추출하지 못했습니다.\n"
                    
                    result += "\n" + "-" * 50 + "\n\n"
                else:
                     await ctx.info(f"[{report_name}] 건너뜀: 요청하신 항목({', '.join(requested_items) if requested_items else '전체'}) 관련 유효 데이터 없음.") # await 추가
            except Exception as e:
                await ctx.error(f"공시 처리 중 예상치 못한 오류 발생 ({report_name}): {e}") # ctx.error에도 await 추가 (만약 비동기라면)
                api_errors.append(f"{report_name}: {str(e)}")
                traceback.print_exc()

        # 최종 결과 메시지 추가
        if api_errors:
            result += "\n## 처리 중 발생한 오류\n"
            for error in api_errors:
                result += f"- {error}\n"
            result += "\n"
            
        if relevant_reports_found == 0 and processed_count > 0:
             no_data_reason = "요청하신 항목 관련 유효한 데이터를 찾지 못했거나" if requested_items else "주요 재무 데이터를 찾지 못했거나"
             result += f"※ 처리된 공시에서 {no_data_reason}, 데이터가 제공되지 않는 보고서일 수 있습니다.\n"
        elif processed_count == 0 and disclosures:
             result += "조회된 정기공시가 있으나, XBRL 데이터를 포함하는 보고서 유형(사업/반기/분기)이 아니거나 처리 중 오류가 발생했습니다.\n"
             
        if len(disclosures) > disclosure_count:
            result += f"※ 총 {len(disclosures)}개의 정기공시 중 최신 {disclosure_count}개에 대해 분석을 시도했습니다.\n"
        
        if relevant_reports_found > 0 and requested_items:
             result += f"\n※ 요청하신 항목({', '.join(requested_items)}) 관련 정보가 있는 {relevant_reports_found}개의 보고서를 표시했습니다.\n"

    except Exception as e:
        return f"재무 정보 검색 중 예상치 못한 오류가 발생했습니다: {str(e)}\n\n{traceback.format_exc()}"

    result += chat_guideline
    return result.strip()


@mcp.tool()
async def search_detailed_financial_data(
    company_name: str,
    start_date: str,
    end_date: str,
    ctx: Context,
    statement_type: Optional[str] = None,
) -> str:
    """
    회사의 세부적인 재무 정보를 제공하는 도구.
    
    Args:
        company_name: 회사명 (예: 삼성전자, 네이버 등)
        start_date: 시작일 (YYYYMMDD 형식, 예: 20250101)
        end_date: 종료일 (YYYYMMDD 형식, 예: 20251231)
        ctx: MCP Context 객체
        statement_type: 재무제표 유형 ("재무상태표", "손익계산서", "현금흐름표" 중 하나 또는 None)
                       None인 경우 모든 유형의 재무제표 정보를 반환합니다.
        
    Returns:
        선택한 재무제표 유형(들)의 세부 항목 정보가 포함된 텍스트
    """
    # 결과 문자열 초기화
    result = ""
    api_errors = []
    
    try:
        # 재무제표 유형 검증
        if statement_type is not None and statement_type not in STATEMENT_TYPES:
            return f"지원하지 않는 재무제표 유형입니다. 지원되는 유형: {', '.join(STATEMENT_TYPES.keys())}"
        
        # 모든 재무제표 유형을 처리할 경우
        if statement_type is None:
            all_statement_types = list(STATEMENT_TYPES.keys())
            await ctx.info(f"{company_name}의 모든 재무제표 세부 정보를 검색합니다.") # await 추가
        else:
            all_statement_types = [statement_type]
            await ctx.info(f"{company_name}의 {statement_type} 세부 정보를 검색합니다.") # await 추가
        
        # end_date 조정
        original_end_date = end_date
        adjusted_end_date, was_adjusted = adjust_end_date(end_date)
        
        if was_adjusted:
            await ctx.info(f"공시 제출 기간을 고려하여 검색 종료일을 {original_end_date}에서 {adjusted_end_date}로 자동 조정했습니다.") # await 추가
            end_date = adjusted_end_date
        
        # 회사 코드 조회
        corp_code, matched_name = await get_corp_code_by_name(company_name)
        if not corp_code:
            return f"회사 검색 오류: {matched_name}"
        
        await ctx.info(f"{matched_name}(고유번호: {corp_code})의 공시를 검색합니다.") # await 추가
        
        # 공시 목록 조회
        disclosures, error_msg = await get_disclosure_list(corp_code, start_date, end_date)
        if error_msg:
            return error_msg
            
        if not disclosures:
            date_range_msg = f"{start_date}부터 {end_date}까지"
            if was_adjusted:
                date_range_msg += f" (원래 요청: {start_date}~{original_end_date}, 공시 제출 기간 고려하여 확장)"
            return f"{date_range_msg} '{matched_name}'(고유번호: {corp_code})의 정기공시가 없습니다."
        
        await ctx.info(f"{len(disclosures)}개의 정기공시를 찾았습니다. XBRL 데이터 조회 및 분석을 시도합니다.") # await 추가

        # 결과 문자열 초기화
        result = f"# {matched_name}의 세부 재무 정보 ({start_date} ~ {end_date})\n\n"
        
        # 최대 5개의 공시만 처리 (API 호출 제한 및 시간 고려)
        disclosure_count = min(5, len(disclosures))
        
        # 각 공시별로 XBRL 데이터 조회 및 저장
        processed_disclosures = []
        
        for disclosure in disclosures[:disclosure_count]:
            try:
                report_name = disclosure.get('report_nm', '제목 없음')
                rcept_dt = disclosure.get('rcept_dt', '날짜 없음')
                rcept_no = disclosure.get('rcept_no', '')

                # 보고서 코드 결정
                reprt_code = determine_report_code(report_name)
                if not rcept_no or not reprt_code:
                    continue

                await ctx.info(f"공시 분석 중: {report_name} (접수번호: {rcept_no})") # await 추가
                
                # XBRL 데이터 조회
                xbrl_text = await get_financial_statement_xbrl(rcept_no, reprt_code)
                
                if not xbrl_text.startswith(("DART API 오류:", "API 요청 실패:", "ZIP 파일", "<인코딩 오류:")):
                    processed_disclosures.append({
                        'report_name': report_name,
                        'rcept_dt': rcept_dt,
                        'rcept_no': rcept_no,
                        'reprt_code': reprt_code,
                        'xbrl_text': xbrl_text
                    })
                else:
                    error_summary = xbrl_text.split('\n')[0][:100]
                    api_errors.append(f"{report_name}: {error_summary}")
                    await ctx.warning(f"XBRL 데이터 조회 오류 ({report_name}): {error_summary}") # ctx.warning에도 await 추가 (만약 비동기라면)
            except Exception as e:
                api_errors.append(f"{report_name if 'report_name' in locals() else '알 수 없는 보고서'}: {str(e)}")
                await ctx.error(f"공시 데이터 처리 중 예상치 못한 오류 발생: {e}") # ctx.error에도 await 추가 (만약 비동기라면)
                traceback.print_exc()
        
        # 각 재무제표 유형별 처리
        for current_statement_type in all_statement_types:
            result += f"## {current_statement_type}\n\n"
            
            # 해당 재무제표 유형에 대한 태그 목록 조회
            items_to_extract = DETAILED_TAGS[current_statement_type]
            
            # 재무제표 유형별 결과 저장
            reports_with_data = 0
            
            # 각 공시별 처리
            for disclosure in processed_disclosures:
                try:
                    report_name = disclosure['report_name']
                    rcept_dt = disclosure['rcept_dt']
                    rcept_no = disclosure['rcept_no']
                    xbrl_text = disclosure['xbrl_text']
                    
                    # XBRL 파싱 및 데이터 추출
                    try:
                        financial_data = parse_xbrl_financial_data(xbrl_text, items_to_extract)
                        
                        # 유효한 데이터가 있는지 확인 (최소 1개 항목 이상)
                        valid_items_count = sum(1 for value in financial_data.values() 
                                              if value not in INVALID_VALUE_INDICATORS 
                                              and not value.startswith("오류(") 
                                              and not value.startswith("분석 중"))
                        
                        if valid_items_count >= 1:
                            reports_with_data += 1
                            
                            # 데이터 결과에 추가
                            result += f"### {report_name} ({rcept_dt})\n"
                            result += f"접수번호: {rcept_no}\n\n"
                            
                            # 테이블 형식으로 데이터 출력
                            result += "| 항목 | 값 |\n"
                            result += "|------|------|\n"
                            
                            for item, value in financial_data.items():
                                if value not in INVALID_VALUE_INDICATORS and not value.startswith("오류(") and not value.startswith("분석 중"):
                                    result += f"| {item} | {value} |\n"
                                else:
                                    # 매칭되지 않은 항목은 '-'로 표시
                                    result += f"| {item} | - |\n"
                            
                            result += "\n"
                        else:
                            await ctx.info(f"[{report_name}] {current_statement_type}의 유효한 데이터가 없습니다.") # await 추가
                    except Exception as e:
                        await ctx.warning(f"XBRL 파싱/분석 중 오류 발생 ({report_name}): {e}") # ctx.warning에도 await 추가
                        api_errors.append(f"{report_name} 분석 중 오류: {str(e)}")
                except Exception as e:
                    await ctx.error(f"공시 데이터 처리 중 예상치 못한 오류 발생: {e}") # ctx.error에도 await 추가 (만약 비동기라면)
                    api_errors.append(f"공시 데이터 처리 중 오류 발생: {str(e)}")
                    traceback.print_exc()
            
            # 재무제표 유형별 결과 요약
            if reports_with_data == 0:
                result += f"조회된 공시에서 유효한 {current_statement_type} 데이터를 찾지 못했습니다.\n\n"
            
            result += "-" * 50 + "\n\n"
        
        # 최종 결과 메시지 추가
        if api_errors:
            result += "\n## 처리 중 발생한 오류\n"
            for error in api_errors:
                result += f"- {error}\n"
            result += "\n"
            
        if len(disclosures) > disclosure_count:
            result += f"※ 총 {len(disclosures)}개의 정기공시 중 최신 {disclosure_count}개에 대해 분석을 시도했습니다.\n"
        
        if len(processed_disclosures) == 0:
            result += "※ 모든 공시에서 XBRL 데이터를 추출하는데 실패했습니다. 오류 메시지를 확인해주세요.\n"
        
    except Exception as e:
        return f"세부 재무 정보 검색 중 예상치 못한 오류가 발생했습니다: {str(e)}\n\n{traceback.format_exc()}"

    result += chat_guideline
    return result.strip()


@mcp.tool()
async def search_business_information(
    company_name: str,
    start_date: str,
    end_date: str,
    information_type: str,
    ctx: Context,
) -> str:
    """
    회사의 사업 관련 현황 정보를 제공하는 도구
    
    Args:
        company_name: 회사명 (예: 삼성전자, 네이버 등)
        start_date: 시작일 (YYYYMMDD 형식, 예: 20250101)
        end_date: 종료일 (YYYYMMDD 형식, 예: 20251231)
        information_type: 조회할 정보 유형 
            '사업의 개요' - 회사의 전반적인 사업 내용
            '주요 제품 및 서비스' - 회사의 주요 제품과 서비스 정보
            '원재료 및 생산설비' - 원재료 조달 및 생산 설비 현황
            '매출 및 수주상황' - 매출과 수주 현황 정보
            '위험관리 및 파생거래' - 리스크 관리 방안 및 파생상품 거래 정보
            '주요계약 및 연구개발활동' - 주요 계약 현황 및 R&D 활동
            '기타 참고사항' - 기타 사업 관련 참고 정보
        ctx: MCP Context 객체
        
    Returns:
        요청한 정보 유형에 대한 해당 회사의 사업 정보 텍스트
    """
    # 결과 문자열 초기화
    result = ""
    
    try:
        # 지원하는 정보 유형 검증
        supported_types = [
            '사업의 개요', '주요 제품 및 서비스', '원재료 및 생산설비',
            '매출 및 수주상황', '위험관리 및 파생거래', '주요계약 및 연구개발활동',
            '기타 참고사항'
        ]
        
        if information_type not in supported_types:
            return f"지원하지 않는 정보 유형입니다. 지원되는 유형: {', '.join(supported_types)}"
        
        # 진행 상황 알림
        await ctx.info(f"{company_name}의 {information_type} 정보를 검색합니다.") # await 추가
        
        # end_date 조정
        original_end_date = end_date
        adjusted_end_date, was_adjusted = adjust_end_date(end_date)
        
        if was_adjusted:
            await ctx.info(f"공시 제출 기간을 고려하여 검색 종료일을 {original_end_date}에서 {adjusted_end_date}로 자동 조정했습니다.") # await 추가
            end_date = adjusted_end_date
        
        # 회사 코드 조회
        corp_code, matched_name = await get_corp_code_by_name(company_name)
        if not corp_code:
            return f"회사 검색 오류: {matched_name}"
        
        await ctx.info(f"{matched_name}(고유번호: {corp_code})의 공시를 검색합니다.") # await 추가
        
        # 공시 목록 조회
        disclosures, error_msg = await get_disclosure_list(corp_code, start_date, end_date)
        if error_msg:
            return error_msg
            
        await ctx.info(f"{len(disclosures)}개의 정기공시를 찾았습니다. 적절한 공시를 선택하여 정보를 추출합니다.") # await 추가
        
        # 사업정보를 포함할 가능성이 높은 정기보고서를 우선순위에 따라 필터링
        priority_reports = [
            "사업보고서", "반기보고서", "분기보고서"
        ]
        
        selected_disclosure = None
        
        # 우선순위에 따라 공시 선택
        for priority in priority_reports:
            for disclosure in disclosures:
                report_name = disclosure.get('report_nm', '')
                if priority in report_name:
                    selected_disclosure = disclosure
                    break
            if selected_disclosure:
                break
        
        # 우선순위에 따른 공시를 찾지 못한 경우 첫 번째 공시 선택
        if not selected_disclosure and disclosures:
            selected_disclosure = disclosures[0]
        
        if not selected_disclosure:
            return f"'{matched_name}'의 적절한 공시를 찾을 수 없습니다."
        
        # 선택된 공시 정보
        report_name = selected_disclosure.get('report_nm', '제목 없음')
        rcept_dt = selected_disclosure.get('rcept_dt', '날짜 없음')
        rcept_no = selected_disclosure.get('rcept_no', '')
        
        await ctx.info(f"'{report_name}' (접수일: {rcept_no}, 접수일: {rcept_dt}) 공시에서 '{information_type}' 정보를 추출합니다.") # await 추가
        
        # 섹션 추출
        try:
            section_text = await extract_business_section_from_dart(rcept_no, information_type)
            
            # 추출 결과 확인
            if section_text.startswith(f"공시서류 다운로드 실패") or section_text.startswith(f"'{information_type}' 섹션을 찾을 수 없습니다"):
                api_error = section_text
                result = f"# {matched_name} - {information_type}\n\n"
                result += f"## 출처: {report_name} (접수일: {rcept_dt})\n\n"
                result += f"정보 추출 실패: {api_error}\n\n"
                result += "다음과 같은 이유로 정보를 추출하지 못했습니다:\n"
                result += "1. 해당 공시에 요청하신 정보가 포함되어 있지 않을 수 있습니다.\n"
                result += "2. DART API 호출 중 오류가 발생했을 수 있습니다.\n"
                result += "3. 섹션 추출 과정에서 패턴 매칭에 실패했을 수 있습니다.\n"
                return result
            else:
                # 결과 포맷팅
                result = f"# {matched_name} - {information_type}\n\n"
                result += f"## 출처: {report_name} (접수일: {rcept_dt})\n\n"
                result += section_text
                # 텍스트가 너무 길 경우 앞부분만 반환
                max_length = 5000  # 적절한 최대 길이 설정
                if len(result) > max_length:
                    result = result[:max_length] + f"\n\n... (이하 생략, 총 {len(result)} 자)"
        except Exception as e:
            await ctx.error(f"섹션 추출 중 예상치 못한 오류 발생: {e}") # ctx.error에도 await 추가
            result = f"# {matched_name} - {information_type}\n\n"
            result += f"## 출처: {report_name} (접수일: {rcept_dt})\n\n"
            result += f"정보 추출 실패: {str(e)}\n\n"
            result += "다음과 같은 이유로 정보를 추출하지 못했습니다:\n"
            result += "1. 섹션 추출 과정에서 예외가 발생했습니다.\n"
            result += "2. 오류 상세 정보: " + traceback.format_exc().replace('\n', '\n   ') + "\n"
            
    except Exception as e:
        return f"사업 정보 검색 중 예상치 못한 오류가 발생했습니다: {str(e)}\n\n{traceback.format_exc()}"

    result += chat_guideline
    return result.strip()


@mcp.tool()
async def get_current_date(
    ctx: Context = None
) -> str:
    """
    현재 날짜를 YYYYMMDD 형식으로 반환하는 도구
    
    Args:
        ctx: MCP Context 객체 (선택 사항)
        
    Returns:
        YYYYMMDD 형식의 현재 날짜 문자열
    """
    # 현재 날짜를 YYYYMMDD 형식으로 포맷팅
    formatted_date = datetime.now().strftime("%Y%m%d")
    
    # 컨텍스트가 제공된 경우 로그 출력
    if ctx:
        await ctx.info(f"현재 날짜: {formatted_date}") # await 추가
    
    return formatted_date

# --- SWOT 분석 도구 ---
@mcp.tool(
    name="swot_analysis",
    description=ENHANCED_SWOT_DESCRIPTION
)
async def swot_analysis(
    thought: str,
    thoughtNumber: int,
    totalThoughts: int,
    nextThoughtNeeded: bool,
    analysisStage: str,
    companyName: str = None,
    jobPosition: str = None,
    industry: str = None,
    isRevision: bool = None,
    revisesThought: int = None,
    branchFromThought: int = None,
    branchId: str = None,
    needsMoreThoughts: bool = None,
    dataSource: str = None,
    languagePreference: str = None,
    autoSearch: bool = True
):
    """향상된 기업 SWOT 분석을 위한 단계적 사고 도구.
    
    Args:
        thought: 현재 분석 단계에서의 생각이나 통찰
        thoughtNumber: 현재 생각 번호
        totalThoughts: 예상되는 총 생각 수
        nextThoughtNeeded: 추가 생각이 필요한지 여부
        analysisStage: 현재 분석 단계 ('planning', 'S', 'W', 'O', 'T', 'synthesis', 'recommendation')
        companyName: 분석 대상 기업명
        jobPosition: 지원 직무
        industry: 산업 분야
        isRevision: 이전 생각을 수정하는지 여부
        revisesThought: 수정 대상 생각 번호
        branchFromThought: 분기 시작점 생각 번호
        branchId: 분기 식별자
        needsMoreThoughts: 추가 생각이 필요한지 여부
        dataSource: 정보 출처
        languagePreference: 언어 설정 (ko: 한국어, en: 영어)
        autoSearch: 자동 검색 수행 여부 (기본값: True)
    
    Returns:
        Dict with thought processing results
    """
    input_data = {
        "thought": thought,
        "thoughtNumber": thoughtNumber,
        "totalThoughts": totalThoughts,
        "nextThoughtNeeded": nextThoughtNeeded,
        "analysisStage": analysisStage
    }
    
    # 옵션 파라미터 추가
    if companyName is not None:
        input_data["companyName"] = companyName
    if jobPosition is not None:
        input_data["jobPosition"] = jobPosition
    if industry is not None:
        input_data["industry"] = industry
    if isRevision is not None:
        input_data["isRevision"] = isRevision
    if revisesThought is not None:
        input_data["revisesThought"] = revisesThought
    if branchFromThought is not None:
        input_data["branchFromThought"] = branchFromThought
    if branchId is not None:
        input_data["branchId"] = branchId
    if needsMoreThoughts is not None:
        input_data["needsMoreThoughts"] = needsMoreThoughts
    if dataSource is not None:
        input_data["dataSource"] = dataSource
    if languagePreference is not None:
        input_data["languagePreference"] = languagePreference
    
    # 자동 검색 수행
    if autoSearch and companyName:
        try:
            search_result = await perform_stage_based_search(analysisStage, companyName, jobPosition, industry)
            if search_result:
                # 검색 결과가 있으면 사고 내용 앞에 추가
                input_data["thought"] = f"[자동 검색 결과]\n{search_result}\n\n[사용자 분석]\n{thought}"
                input_data["dataSource"] = "자동 검색 + 사용자 입력"
        except Exception as e:
            logger.error(f"자동 검색 중 오류 발생: {e}")
    
    return swot_server.process_thought(input_data)

async def perform_stage_based_search(stage: str, company_name: str, job_position: str = None, industry: str = None) -> str:
    """
    SWOT 분석 단계에 따라 적절한 검색을 수행하는 함수
    
    Args:
        stage: 분석 단계 ('planning', 'S', 'W', 'O', 'T', 'synthesis', 'recommendation')
        company_name: 회사명
        job_position: 직무명 (선택 사항)
        industry: 산업 분야 (선택 사항)
    
    Returns:
        검색 결과 문자열
    """
    search_results = []
    
    # 현재 날짜 구하기 (재무 정보 검색용)
    current_date = await get_current_date()
    # 1년 전 날짜 계산
    year = int(current_date[:4])
    one_year_ago = f"{year-1}{current_date[4:]}"
    
    try:
        if stage == 'planning':
            # 기업 개요 및 기본 정보 검색
            search_results.append(await search_webkr(f"{company_name} 기업 개요", display=5))
            search_results.append(await search_google(f"{company_name} 기업 개요", num_results=5))
            
            # 최근 뉴스 검색
            search_results.append(await search_news(f"{company_name} 최신", display=3, sort="date"))
            
        elif stage == 'S':  # 강점 분석
            # 기업 강점 관련 검색
            search_results.append(await search_webkr(f"{company_name} 강점 경쟁력", display=5))
            search_results.append(await search_google(f"{company_name} 강점 경쟁력", num_results=5))
            
            # 재무 정보 검색 - 자산, 매출 등
            try:
                financial_data = await search_disclosure(company_name, one_year_ago, current_date, 
                                                         requested_items=["매출액", "영업이익", "당기순이익"])
                search_results.append(financial_data)
            except Exception as e:
                pass
                
            # 제품 및 서비스 정보
            try:
                business_info = await search_business_information(company_name, one_year_ago, current_date, 
                                                                 "주요 제품 및 서비스")
                search_results.append(business_info)
            except Exception as e:
                pass
            
        elif stage == 'W':  # 약점 분석
            # 기업 약점 관련 검색
            search_results.append(await search_webkr(f"{company_name} 약점 문제점", display=5))
            search_results.append(await search_google(f"{company_name} 약점 문제점", num_results=5))
            
            # 경쟁사 비교 검색
            if industry:
                search_results.append(await search_webkr(f"{company_name} {industry} 경쟁사 비교", display=5))
                search_results.append(await search_google(f"{company_name} {industry} 경쟁사 비교", num_results=5))
            
        elif stage == 'O':  # 기회 분석
            # 산업 트렌드 검색
            if industry:
                search_results.append(await search_news(f"{industry} 트렌드 전망", display=3, sort="date"))
            
            # 기업 기회 요인 검색
            search_results.append(await search_webkr(f"{company_name} 기회 성장", display=5))
            search_results.append(await search_google(f"{company_name} 기회 성장", num_results=5))
            
        elif stage == 'T':  # 위협 분석
            # 위험 요소 검색
            search_results.append(await search_webkr(f"{company_name} 위협 리스크", display=5))
            search_results.append(await search_google(f"{company_name} 위협 리스크", num_results=5))
            
            # 산업 위협 요소 검색
            if industry:
                search_results.append(await search_news(f"{industry} 위기 규제", display=3, sort="date"))

        elif stage == 'synthesis':  # 종합 분석
            # SWOT 종합 분석 검색
            search_results.append(await search_swot_webkr(company_name, display=5))
            search_results.append(await search_google(f"{company_name} SWOT 분석", num_results=5))
            
        elif stage == 'recommendation':  # 지원 전략
            # 채용 정보 검색
            if job_position:
                search_results.append(await search_webkr(f"{company_name} {job_position} 채용 자격", display=5))
                search_results.append(await search_google(f"{company_name} {job_position} 채용 자격", num_results=5))

            # 기업 문화 검색
            search_results.append(await search_webkr(f"{company_name} 기업문화 조직문화", display=5))
            search_results.append(await search_google(f"{company_name} 기업문화 조직문화", num_results=5))
    
    except Exception as e:
        return f"검색 중 오류가 발생했습니다: {str(e)}"
    
    # 검색 결과 요약 및 정리
    summarized_results = []
    for result in search_results:
        if result and isinstance(result, str):
            # 너무 긴 결과 요약
            if len(result) > 1500:
                result = result[:1500] + "...(중략)..."
            summarized_results.append(result)
    
    return "\n\n---\n\n".join(summarized_results)

# SWOT 분석을 위한 추가 도구
@mcp.tool()
async def search_company_swot(company_name: str) -> str:
    """
    특정 기업의 SWOT 분석 정보를 검색하고 종합하는 도구
    
    Args:
        company_name: 기업명
    
    Returns:
        SWOT 분석 종합 정보
    """
    search_results = []
    
    try:
        # 현재 날짜 구하기
        current_date = await get_current_date()
        # 1년 전 날짜 계산
        year = int(current_date[:4])
        one_year_ago = f"{year-1}{current_date[4:]}"
        
        # 1. 기업 SWOT 분석 웹 검색
        swot_search = await search_swot_webkr(company_name, display=3)
        search_results.append(f"## SWOT 분석 검색 결과\n{swot_search}")
        
        # 2. 최신 뉴스 검색
        news_search = await search_news(f"{company_name} 최신", display=3, sort="date")
        search_results.append(f"## 최신 뉴스\n{news_search}")
        
        # 3. 재무 정보 검색
        try:
            financial_data = await search_disclosure(company_name, one_year_ago, current_date, 
                                                   requested_items=["매출액", "영업이익", "당기순이익"])
            search_results.append(f"## 재무 정보\n{financial_data}")
        except Exception as e:
            search_results.append(f"## 재무 정보\n재무정보 검색 실패: {str(e)}")
        
        # 4. 제품 및 서비스 정보
        try:
            business_info = await search_business_information(company_name, one_year_ago, current_date, 
                                                           "주요 제품 및 서비스")
            # 너무 긴 내용 요약
            if len(business_info) > 1500:
                business_info = business_info[:1500] + "...(중략)..."
            search_results.append(f"## 제품 및 서비스 정보\n{business_info}")
        except Exception as e:
            search_results.append(f"## 제품 및 서비스 정보\n정보 검색 실패: {str(e)}")
        
        # 결과 종합 및 반환
        return "\n\n---\n\n".join(search_results)
    
    except Exception as e:
        return f"SWOT 분석 검색 중 오류가 발생했습니다: {str(e)}"

# --- 네이버 검색 MCP 도구 ---
@mcp.tool()
async def search_blog(query: str, display: int = 10, page: int = 1, sort: str = "sim") -> str:
    """
    블로그 검색 도구
    
    네이버 블로그 검색 API를 사용하여 주어진 키워드에 대한 블로그 글을 검색합니다.
    
    Args:
        query: 검색어
        display: 반환할 결과 수 (최대 100)
        page: 결과 페이지 번호
        sort: 정렬 방식 (sim: 유사도순, date: 날짜순)
        
    Returns:
        str: 검색 결과 문자열
    """
    # 시작 위치 계산
    start = calculate_start(page, display)
    
    # API 호출을 위한 파라미터 설정
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort
    }
    
    # API 호출 및 결과 반환
    return await _make_naver_api_call("blog.json", params, BlogResult, "블로그")

@mcp.tool()
async def search_news(query: str, display: int = 10, page: int = 1, sort: str = "sim") -> str:
    """
    뉴스 검색 도구
    
    네이버 뉴스 검색 API를 사용하여 주어진 키워드에 대한 뉴스 기사를 검색합니다.
    
    Args:
        query: 검색어
        display: 반환할 결과 수 (최대 100)
        page: 결과 페이지 번호
        sort: 정렬 방식 (sim: 유사도순, date: 날짜순)
        
    Returns:
        str: 검색 결과 문자열
    """
    # 시작 위치 계산
    start = calculate_start(page, display)
    
    # API 호출을 위한 파라미터 설정
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort
    }
    
    # API 호출 및 결과 반환
    return await _make_naver_api_call("news.json", params, NewsResult, "뉴스")

# @mcp.tool()
# async def search_book(query: str, display: int = 10, page: int = 1, sort: str = "sim") -> str:
#     """
#     도서 검색 도구
    
#     네이버 도서 검색 API를 사용하여 주어진 키워드에 대한 도서 정보를 검색합니다.
    
#     Args:
#         query: 검색어
#         display: 반환할 결과 수 (최대 100)
#         page: 결과 페이지 번호
#         sort: 정렬 방식 (sim: 유사도순, date: 출간일순)
        
#     Returns:
#         str: 검색 결과 문자열
#     """
#     # 시작 위치 계산
#     start = calculate_start(page, display)
    
#     # API 호출을 위한 파라미터 설정
#     params = {
#         "query": query,
#         "display": display,
#         "start": start,
#         "sort": sort
#     }
    
#     # API 호출 및 결과 반환
#     return await _make_naver_api_call("book.json", params, BookResult, "도서")

# @mcp.tool()
# async def search_encyclopedia(query: str, display: int = 10, page: int = 1, sort: str = "sim") -> str:
#     """
#     백과사전 검색 도구
    
#     네이버 백과사전 검색 API를 사용하여 주어진 키워드에 대한 백과사전 정보를 검색합니다.
    
#     Args:
#         query: 검색어
#         display: 반환할 결과 수 (최대 100)
#         page: 결과 페이지 번호
#         sort: 정렬 방식 (sim: 유사도순, date: 날짜순)
        
#     Returns:
#         str: 검색 결과 문자열
#     """
#     # 시작 위치 계산
#     start = calculate_start(page, display)
    
#     # API 호출을 위한 파라미터 설정
#     params = {
#         "query": query,
#         "display": display,
#         "start": start,
#         "sort": sort
#     }
    
#     # API 호출 및 결과 반환
#     return await _make_naver_api_call("encyc.json", params, EncycResult, "백과사전")

@mcp.tool()
async def search_cafe_article(query: str, display: int = 10, page: int = 1, sort: str = "sim") -> str:
    """
    카페 글 검색 도구
    
    네이버 카페 글 검색 API를 사용하여 주어진 키워드에 대한 카페 글을 검색합니다.
    
    Args:
        query: 검색어
        display: 반환할 결과 수 (최대 100)
        page: 결과 페이지 번호
        sort: 정렬 방식 (sim: 유사도순, date: 날짜순)
        
    Returns:
        str: 검색 결과 문자열
    """
    # 시작 위치 계산
    start = calculate_start(page, display)
    
    # API 호출을 위한 파라미터 설정
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort
    }
    
    # API 호출 및 결과 반환
    return await _make_naver_api_call("cafearticle.json", params, CafeArticleResult, "카페 글")

@mcp.tool()
async def search_kin(query: str, display: int = 10, page: int = 1, sort: str = "sim") -> str:
    """
    지식iN 검색 도구
    
    네이버 지식iN 검색 API를 사용하여 주어진 키워드에 대한 질문과 답변을 검색합니다.
    
    Args:
        query: 검색어
        display: 반환할 결과 수 (최대 100)
        page: 결과 페이지 번호
        sort: 정렬 방식 (sim: 유사도순, date: 날짜순, point: 조회순)
        
    Returns:
        str: 검색 결과 문자열
    """
    # 시작 위치 계산
    start = calculate_start(page, display)
    
    # API 호출을 위한 파라미터 설정
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort
    }
    
    # API 호출 및 결과 반환
    return await _make_naver_api_call("kin.json", params, KinResult, "지식iN")

@mcp.tool()
async def search_webkr(query: str, display: int = 10, page: int = 1) -> str:
    """
    웹문서 검색 도구
    
    네이버 웹문서 검색 API를 사용하여 주어진 키워드에 대한 웹문서를 검색합니다.
    
    Args:
        query: 검색어
        display: 반환할 결과 수 (최대 100)
        page: 결과 페이지 번호
        
    Returns:
        str: 검색 결과 문자열
    """
    # 시작 위치 계산
    start = calculate_start(page, display)
    
    # API 호출을 위한 파라미터 설정
    params = {
        "query": query,
        "display": display,
        "start": start
    }
    
    # API 호출 및 결과 반환
    return await _make_naver_api_call("webkr.json", params, WebkrResult, "웹문서")

@mcp.tool(
    name="search_swot_webkr",
    description="Searches for SWOT analysis of a given company using the given company name. The page parameter allows for page navigation."
)
async def search_swot_webkr(company_name: str, display: int = 10, page: int = 1, sort: str = "date") -> str:
    """
    기업 SWOT 분석 웹 검색 도구
    
    주어진 회사명에 대한 SWOT 분석 정보를 웹에서 검색합니다.
    
    Args:
        company_name: 회사명
        display: 반환할 결과 수 (최대 100)
        page: 결과 페이지 번호
        sort: 정렬 방식 (sim: 유사도순, date: 날짜순)
        
    Returns:
        str: 검색 결과 문자열
    """
    # 검색어 생성 (회사명 + SWOT 분석)
    query = f"{company_name} SWOT 분석"
    
    # 시작 위치 계산
    start = calculate_start(page, display)
    
    # API 호출을 위한 파라미터 설정
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": sort
    }
    
    # API 호출 및 결과 반환
    return await _make_naver_api_call("webkr.json", params, WebkrResult, "SWOT 분석 웹문서")

# URL 가져오기 관련 상수
DEFAULT_USER_AGENT = "ModelContextProtocol/1.0 (CompanyAnalysis; +https://github.com/modelcontextprotocol/servers)"

def determine_report_code(report_name: str) -> Optional[str]:
    """
    보고서 이름으로 보고서 코드 결정
    
    Args:
        report_name: 보고서 이름
    
    Returns:
        해당하는 보고서 코드 또는 None
    """
    if "사업보고서" in report_name:
        return REPORT_CODE["사업보고서"]
    elif "반기보고서" in report_name:
        return REPORT_CODE["반기보고서"]
    elif "분기보고서" in report_name:
        if ".03)" in report_name or "(1분기)" in report_name:
            return REPORT_CODE["1분기보고서"]
        elif ".09)" in report_name or "(3분기)" in report_name:
            return REPORT_CODE["3분기보고서"]
    
    return None


def adjust_end_date(end_date: str) -> Tuple[str, bool]:
    """
    공시 제출 기간을 고려하여 종료일 조정
    
    Args:
        end_date: 원래 종료일 (YYYYMMDD)
    
    Returns:
        조정된 종료일과 조정 여부
    """
    try:
        # 입력된 end_date를 datetime 객체로 변환
        end_date_obj = datetime.strptime(end_date, "%Y%m%d")
        
        # 현재 날짜 가져오기
        current_date = datetime.now()
        
        # end_date가 현재 날짜보다 과거인 경우 현재 날짜로 조정
        if end_date_obj < current_date:
            end_date_obj = current_date
        
        # 95일 추가
        adjusted_end_date_obj = end_date_obj + timedelta(days=95)
        
        # 현재 날짜보다 미래인 경우 현재 날짜로 조정
        if adjusted_end_date_obj > current_date:
            adjusted_end_date_obj = current_date
        
        # 다시 문자열로 변환
        adjusted_end_date = adjusted_end_date_obj.strftime("%Y%m%d")
        
        # 조정 여부 반환
        return adjusted_end_date, adjusted_end_date != end_date
    except Exception as e:
        logger.error(f"날짜 조정 중 오류 발생: {str(e)}")
        return end_date, False

# ===== URL 가져오기 관련 코드 =====

def detect_namespaces(xbrl_content: str, base_namespaces: Dict[str, str]) -> Dict[str, str]:
    """
    XBRL 문서에서 네임스페이스를 추출하고 기본 네임스페이스와 병합
    
    Args:
        xbrl_content: XBRL 문서 내용
        base_namespaces: 기본 네임스페이스 딕셔너리
    
    Returns:
        업데이트된 네임스페이스 딕셔너리
    """
    namespaces = base_namespaces.copy()
    detected = {}
    
    try:
        for event, node in ET.iterparse(StringIO(xbrl_content), events=['start-ns']):
            prefix, uri = node
            if prefix and prefix not in namespaces:
                namespaces[prefix] = uri
                detected[prefix] = uri
            elif prefix and namespaces.get(prefix) != uri:
                namespaces[prefix] = uri
                detected[prefix] = uri
    except Exception:
        pass  # 네임스페이스 감지 실패 시 기본값 사용
    
    return namespaces, detected


def extract_fiscal_year(context_refs: Set[str]) -> str:
    """
    contextRef 집합에서 회계연도 추출
    
    Args:
        context_refs: XBRL 문서에서 추출한 contextRef 집합
    
    Returns:
        감지된 회계연도 또는 현재 연도
    """
    for context_ref in context_refs:
        if 'CFY' in context_ref and len(context_ref) > 7:
            match = re.search(r'CFY(\d{4})', context_ref)
            if match:
                return match.group(1)
    
    # 회계연도를 찾지 못한 경우, 현재 연도를 사용
    return str(datetime.now().year)


def get_pattern_by_item_type(item_name: str) -> Dict[str, str]:
    """
    항목 유형에 따른 적절한 패턴 선택
    
    Args:
        item_name: 재무 항목 이름
    
    Returns:
        항목 유형에 맞는 패턴 딕셔너리
    """
    # 현금흐름표 항목 확인
    if item_name in CASH_FLOW_ITEMS or item_name in DETAILED_TAGS["현금흐름표"]:
        return CASH_FLOW_PATTERNS
    
    # 재무상태표 항목 확인
    elif item_name in BALANCE_SHEET_ITEMS or item_name in DETAILED_TAGS["재무상태표"]:
        return BALANCE_SHEET_PATTERNS
    
    # 손익계산서 항목 (기본값)
    else:
        return REPORT_PATTERNS


def format_numeric_value(value_text: str, decimals: str) -> str:
    """
    XBRL 숫자 값을 보기 좋은 형식으로 변환
    
    Args:
        value_text: XBRL 항목의 값
        decimals: 소수점 자리수 설정
    
    Returns:
        포맷팅된 값
    """
    try:
        value = float(value_text)
        
        # 매우 큰 숫자는 문자열로 처리하여 반환 (큰 숫자 처리시 오버플로우 방지)
        if abs(value) > 1e14:  # 100조 이상의 큰 숫자
            # 문자열 형태로 표시하여 숫자 그대로 반환
            if decimals and int(decimals) > 0:
                return value_text
            else:
                # 정수 부분만 표시
                return f"{int(value):,}"
        
        # 소수점 처리
        if decimals and int(decimals) > 0:
            format_str = f"{{:,.{abs(int(decimals))}f}}"
            return format_str.format(value)
        else:
            # 부동소수점 정밀도 문제 방지를 위해 정수로 변환 후 콤마 추가
            return f"{int(value):,}"
    except (ValueError, TypeError):
        return value_text  # 변환할 수 없는 경우 원본 반환


def parse_xbrl_financial_data(xbrl_content: str, items_and_tags: Dict[str, List[str]]) -> Dict[str, str]:
    """
    XBRL 문서의 특정 재무 항목들을 추출하는 함수
    
    Args:
        xbrl_content: XBRL 문서 내용
        items_and_tags: 추출할 재무 항목 이름과 해당 XBRL 태그 목록의 딕셔너리
            예: {"매출액": ["ifrs-full:Revenue"]}
    
    Returns:
        재무 항목 이름과 추출된 값의 딕셔너리
    """
    if not xbrl_content or not items_and_tags:
        return {"오류": "입력 데이터가 없습니다."}
    
    # 결과 초기화
    result = {}
    
    try:
        # 네임스페이스 기본값
        base_namespaces = {
            "xbrli": "http://www.xbrl.org/2003/instance",
            "dart": "http://dart.fss.or.kr/xbrl",
            "ifrs-full": "http://xbrl.ifrs.org/taxonomy/",
            "ko-gaap": "http://dart.fss.or.kr/",
        }
        
        # XBRL 문서에서 네임스페이스 검출
        namespaces, detected = detect_namespaces(xbrl_content, base_namespaces)
        
        # contextRef 캐시 (동일 패턴 검색 재사용)
        context_ref_cache = {}
        
        # 문서 내 모든 항목에 대한 contextRef 집합 수집
        all_context_refs = set()
        for match in re.finditer(r'contextRef="([^"]+)"', xbrl_content):
            all_context_refs.add(match.group(1))
        
        # 문서 내 회계연도 정보 추출 시도
        fiscal_year = extract_fiscal_year(all_context_refs)
        
        # 각 요청 항목에 대해 처리
        for item_name, tag_list in items_and_tags.items():
            item_value = "N/A"  # 기본값
            found = False
            
            # 항목 유형에 맞는 패턴 선택
            pattern_by_type = get_pattern_by_item_type(item_name)
            
            # 전체 태그에 대해 검색
            for tag in tag_list:
                # 항목을 찾기 위한 가능한 모든 패턴 조합
                for period_type, pattern in pattern_by_type.items():
                    # 캐시된 context_ref가 있으면 재사용
                    context_cache_key = f"{period_type}_{fiscal_year}"
                    
                    if context_cache_key in context_ref_cache:
                        matching_contexts = context_ref_cache[context_cache_key]
                    else:
                        # 해당 패턴에 맞는 모든 contextRef 수집
                        pattern_regex = f"{pattern}{fiscal_year}"
                        matching_contexts = [ref for ref in all_context_refs if pattern_regex in ref]
                        context_ref_cache[context_cache_key] = matching_contexts
                    
                    if not matching_contexts:
                        continue
                    
                    # 태그에 대한 정규식 패턴 (네임스페이스 고려)
                    escaped_tag = re.escape(tag)
                    tag_parts = tag.split(':')
                    
                    # 태그 정규식 만들기
                    if len(tag_parts) > 1 and tag_parts[0] in namespaces:
                        # 네임스페이스가 있는 경우
                        ns_prefix = tag_parts[0]
                        local_name = tag_parts[1]
                        
                        # 일반적인 태그 형식 (네임스페이스:로컬명)
                        tag_pattern = escaped_tag
                        
                        # 모든 contextRef에 대해 검색
                        for context_ref in matching_contexts:
                            for tag_format in [
                                # 일반 태그 형식
                                f'<{escaped_tag}\\s+[^>]*?contextRef="{re.escape(context_ref)}"[^>]*?>\\s*([^<]+?)\\s*</{escaped_tag}>',
                                # 짧은 형식 (네임스페이스 없이)
                                f'<{re.escape(local_name)}\\s+[^>]*?contextRef="{re.escape(context_ref)}"[^>]*?>\\s*([^<]+?)\\s*</{re.escape(local_name)}>',
                                # 역방향 태그 형식
                                f'</{escaped_tag}>\\s*([^<]+?)\\s*<{escaped_tag}\\s+[^>]*?contextRef="{re.escape(context_ref)}"[^>]*?>'
                            ]:
                                matches = re.findall(tag_format, xbrl_content)
                                if matches:
                                    # 숫자 값 형식화 시도
                                    raw_value = matches[0]
                                    
                                    # 단위 속성 추출 시도
                                    decimals_match = re.search(f'<{escaped_tag}\\s+[^>]*?decimals="([^"]+)"[^>]*?>', xbrl_content)
                                    decimals_value = decimals_match.group(1) if decimals_match else "0"
                                    
                                    # 숫자 형식 변환
                                    item_value = format_numeric_value(raw_value, decimals_value)
                                    found = True
                                    break
                            
                            if found:
                                break
                        
                    if found:
                        break
                
                if found:
                    break
            
            # 결과에 항목 추가 (값을 찾은 경우에만 실제 값, 아니면 N/A)
            result[item_name] = item_value
        
        return result
        
    except Exception as e:
        logger.error(f"XBRL 파싱 오류: {str(e)}")
        return {key: "XBRL 파싱 오류" for key in items_and_tags.keys()}


def extract_business_section(document_text: str, section_type: str) -> str:
    """
    공시서류 원본파일 텍스트에서 특정 비즈니스 섹션만 추출하는 함수
    
    Args:
        document_text: 공시서류 원본 텍스트
        section_type: 추출할 섹션 유형 
                     ('사업의 개요', '주요 제품 및 서비스', '원재료 및 생산설비',
                      '매출 및 수주상황', '위험관리 및 파생거래', '주요계약 및 연구개발활동',
                      '기타 참고사항')
    
    Returns:
        추출된 섹션 텍스트 (태그 제거 및 정리된 상태)
    """
    import re
    
    # SECTION 태그 형식 확인
    section_tags = re.findall(r'<SECTION[^>]*>', document_text)
    section_end_tags = re.findall(r'</SECTION[^>]*>', document_text)
    
    # TITLE 태그가 있는지 확인
    title_tags = re.findall(r'<TITLE[^>]*>(.*?)</TITLE>', document_text)
    
    # 섹션 타입별 패턴 매핑 (번호가 포함된 경우도 처리) - lookahead 구문 수정
    section_patterns = {
        '사업의 개요': r'<TITLE[^>]*>(?:\d+\.\s*)?사업의\s*개요[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
        '주요 제품 및 서비스': r'<TITLE[^>]*>(?:\d+\.\s*)?주요\s*제품[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
        '원재료 및 생산설비': r'<TITLE[^>]*>(?:\d+\.\s*)?원재료[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
        '매출 및 수주상황': r'<TITLE[^>]*>(?:\d+\.\s*)?매출[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
        '위험관리 및 파생거래': r'<TITLE[^>]*>(?:\d+\.\s*)?위험관리[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
        '주요계약 및 연구개발활동': r'<TITLE[^>]*>(?:\d+\.\s*)?주요\s*계약[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
        '기타 참고사항': r'<TITLE[^>]*>(?:\d+\.\s*)?기타\s*참고사항[^<]*</TITLE>(.*?)(?:(?=<TITLE)|(?=</SECTION))',
    }
    
    # 요청된 섹션 패턴 확인
    if section_type not in section_patterns:
        return f"지원하지 않는 섹션 유형입니다. 지원되는 유형: {', '.join(section_patterns.keys())}"
    
    # 해당 섹션과 일치하는 제목 찾기
    section_keyword = section_type.split(' ')[0]
    matching_titles = [title for title in title_tags if section_keyword.lower() in title.lower()]
    
    # 정규표현식 패턴으로 섹션 추출 시도 1: 기본 패턴
    pattern = section_patterns[section_type]
    matches = re.search(pattern, document_text, re.DOTALL | re.IGNORECASE)
    
    # 정규표현식 패턴으로 섹션 추출 시도 2: SECTION 태그 종료 패턴 수정
    if not matches:
        # SECTION-숫자 형태의 종료 태그 지원
        pattern = section_patterns[section_type].replace('</SECTION', '</SECTION(?:-\\d+)?')
        matches = re.search(pattern, document_text, re.DOTALL | re.IGNORECASE)
    
    # 정규표현식 패턴으로 섹션 추출 시도 3: 개별 TITLE 직접 검색
    if not matches and matching_titles:
        for title in matching_titles:
            escaped_title = re.escape(title)
            direct_pattern = f'<TITLE[^>]*>{escaped_title}</TITLE>(.*?)(?=<TITLE|</SECTION(?:-\\d+)?)'
            matches = re.search(direct_pattern, document_text, re.DOTALL | re.IGNORECASE)
            if matches:
                break
    
    if not matches:
        return f"'{section_type}' 섹션을 찾을 수 없습니다."
    
    # 추출된 텍스트
    section_text = matches.group(1)
    
    # 태그 제거 및 텍스트 정리
    clean_text = re.sub(r'<[^>]*>', ' ', section_text)  # HTML 태그 제거
    clean_text = re.sub(r'USERMARK\s*=\s*"[^"]*"', '', clean_text)  # USERMARK 제거
    clean_text = re.sub(r'\s+', ' ', clean_text)  # 연속된 공백 제거
    clean_text = re.sub(r'\n\s*\n', '\n\n', clean_text)  # 빈 줄 처리
    clean_text = clean_text.strip()  # 앞뒤 공백 제거
    
    return clean_text


async def get_original_document(rcept_no: str) -> Tuple[str, Optional[bytes]]:
    """
    DART 공시서류 원본파일을 다운로드하여 텍스트로 변환해 반환하는 함수
    
    Args:
        rcept_no: 공시 접수번호(14자리)
        
    Returns:
        (파일 내용 문자열 또는 오류 메시지, 원본 바이너리 데이터(성공 시) 또는 None(실패 시))
    """
    url = f"{BASE_URL}/document.xml?crtfc_key={API_KEY}&rcept_no={rcept_no}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            
            # 응답 데이터 기본 정보 로깅
            content_type = response.headers.get('content-type', '알 수 없음')
            content_length = len(response.content)
            content_md5 = hashlib.md5(response.content).hexdigest()
            
            logger.info(f"DART API 원본 문서 응답 정보: URL={url}, 상태코드={response.status_code}, Content-Type={content_type}, 크기={content_length}바이트, MD5={content_md5}")
            
            if response.status_code != 200:
                logger.error(f"원본 문서 API 요청 실패: HTTP 상태 코드 {response.status_code}")
                return f"API 요청 실패: HTTP 상태 코드 {response.status_code}", None
            
            # API 오류 메시지 확인 시도 (XML 형식일 수 있음)
            try:
                root = ET.fromstring(response.content)
                status = root.findtext('status')
                message = root.findtext('message')
                if status and message:
                    logger.error(f"DART API 오류 응답: status={status}, message={message}")
                    return f"DART API 오류: {status} - {message}", None
            except ET.ParseError:
                # 파싱 오류는 정상적인 ZIP 파일일 수 있으므로 계속 진행
                pass
            
            try:
                # ZIP 파일 처리
                with zipfile.ZipFile(BytesIO(response.content)) as zip_file:
                    # 압축 파일 내의 파일 목록
                    file_list = zip_file.namelist()
                    
                    logger.info(f"ZIP 파일 내 파일 목록: {file_list}")
                    
                    if not file_list:
                        return "ZIP 파일 내에 파일이 없습니다.", None
                    
                    # 파일명이 가장 짧은 파일 선택 (일반적으로 메인 파일일 가능성이 높음)
                    target_file = min(file_list, key=len)
                    file_ext = target_file.split('.')[-1].lower()
                    
                    logger.info(f"선택된 대상 파일: {target_file}, 확장자: {file_ext}")
                    
                    # 파일 내용 읽기
                    with zip_file.open(target_file) as doc_file:
                        file_content = doc_file.read()
                        
                        # 텍스트 파일인 경우 (txt, html, xml 등)
                        if file_ext in ['txt', 'html', 'htm', 'xml', 'xbrl']:
                            # 다양한 인코딩 시도
                            encodings = ['utf-8', 'euc-kr', 'cp949']
                            text_content = None
                            
                            for encoding in encodings:
                                try:
                                    text_content = file_content.decode(encoding)
                                    logger.info(f"파일 {target_file} 디코딩 성공 (인코딩: {encoding})")
                                    break
                                except UnicodeDecodeError:
                                    logger.info(f"파일 {target_file} {encoding} 디코딩 실패")
                                    continue
                            
                            if text_content:
                                return text_content, file_content
                            else:
                                logger.error(f"파일 {target_file} 모든 인코딩 디코딩 실패")
                                return "파일을 텍스트로 변환할 수 없습니다 (인코딩 문제).", file_content
                        # PDF 또는 기타 바이너리 파일
                        else:
                            logger.info(f"비텍스트 파일 형식 감지: {file_ext}")
                            return f"파일이 텍스트 형식이 아닙니다 (형식: {file_ext}).", file_content
                        
            except zipfile.BadZipFile:
                logger.error(f"유효하지 않은 ZIP 파일: URL={url}, Content-Type={content_type}, 크기={content_length}바이트")
                
                # 파일 시작 부분(처음 50~100바이트) 16진수로 덤프하여 로깅
                content_head = response.content[:100]
                hex_dump = binascii.hexlify(content_head).decode('utf-8')
                hex_formatted = ' '.join(hex_dump[i:i+2] for i in range(0, len(hex_dump), 2))
                logger.error(f"유효하지 않은 ZIP 파일 헤더 덤프(100바이트): {hex_formatted}")
                
                # 여러 인코딩으로 해석 시도하고 내용 로깅
                encodings_to_try = ['utf-8', 'euc-kr', 'cp949', 'latin-1']
                for encoding in encodings_to_try:
                    try:
                        content_preview = response.content[:1000].decode(encoding)
                        content_preview = content_preview.replace('\n', ' ')[:200]  # 줄바꿈 제거, 200자로 제한
                        logger.info(f"{encoding} 인코딩으로 해석한 내용(일부): {content_preview}")
                        
                        # XML 형식인지 확인
                        if content_preview.strip().startswith('<?xml') or content_preview.strip().startswith('<'):
                            logger.info(f"응답 데이터가 XML 형식일 가능성이 있음 (인코딩: {encoding})")
                            try:
                                error_root = ET.fromstring(response.content.decode(encoding))
                                error_status = error_root.findtext('status')
                                error_message = error_root.findtext('message')
                                if error_status and error_message:
                                    logger.info(f"오류 XML 파싱 성공: {error_status} - {error_message}")
                                    return f"DART API 오류: {error_status} - {error_message}", None
                            except ET.ParseError as xml_err:
                                logger.error(f"XML 파싱 시도 실패: {xml_err}")
                            
                    except UnicodeDecodeError:
                        logger.info(f"{encoding} 인코딩으로 해석 실패")
                
                # 파일 시그니처 확인 (처음 4~8바이트)
                file_sig_hex = binascii.hexlify(response.content[:8]).decode('utf-8')
                logger.info(f"파일 시그니처(HEX): {file_sig_hex}")
                
                # 일반적인 파일 형식들의 시그니처와 비교
                known_signatures = {
                    "504b0304": "ZIP 파일(정상)",
                    "3c3f786d": "XML 문서",
                    "7b227374": "JSON 문서",
                    "1f8b0800": "GZIP 압축파일",
                    "ffd8ffe0": "JPEG 이미지",
                    "89504e47": "PNG 이미지",
                    "25504446": "PDF 문서"
                }
                
                for sig, desc in known_signatures.items():
                    if file_sig_hex.startswith(sig):
                        logger.info(f"파일 형식 인식: {desc}")
                
                return "다운로드한 파일이 유효한 ZIP 파일이 아닙니다.", None
                
    except httpx.RequestError as e:
        logger.error(f"원본 문서 API 요청 중 네트워크 오류: {e}")
        return f"API 요청 중 네트워크 오류 발생: {str(e)}", None
    except Exception as e:
        logger.error(f"공시 원본 다운로드 중 예상치 못한 오류: {e}, 스택트레이스: {traceback.format_exc()}")
        return f"공시 원본 다운로드 중 예상치 못한 오류 발생: {str(e)}", None


async def extract_business_section_from_dart(rcept_no: str, section_type: str) -> str:
    """
    DART API를 통해 공시서류를 다운로드하고 특정 비즈니스 섹션만 추출하는 함수
    
    Args:
        rcept_no: 공시 접수번호(14자리)
        section_type: 추출할 섹션 유형 
                    ('사업의 개요', '주요 제품 및 서비스', '원재료 및 생산설비',
                     '매출 및 수주상황', '위험관리 및 파생거래', '주요계약 및 연구개발활동',
                     '기타 참고사항')
    
    Returns:
        추출된 섹션 텍스트 또는 오류 메시지
    """
    # 원본 문서 다운로드
    document_text, binary_data = await get_original_document(rcept_no)
    
    # 다운로드 실패 시
    if binary_data is None:
        return f"공시서류 다운로드 실패: {document_text}"
    
    # 섹션 추출
    section_text = extract_business_section(document_text, section_type)
    
    return section_text

def detect_encoding(response):
    """응답에서 인코딩을 감지합니다."""
    # 1. Content-Type 헤더에서 인코딩 확인
    content_type = response.headers.get('content-type', '')
    if 'charset=' in content_type:
        charset = content_type.split('charset=')[-1].split(';')[0].strip()
        return charset
        
    # 2. 응답 콘텐츠에서 인코딩 감지
    content = response.content
    if content:
        encoding = chardet.detect(content)['encoding']
        if encoding:
            return encoding
    
    # 3. 기본 인코딩 반환
    return 'utf-8'

def extract_content_from_html(html: str, url: str) -> Dict[str, Any]:
    """HTML에서 주요 내용을 추출하고 마크다운으로 변환합니다."""
    soup = BeautifulSoup(html, 'html.parser', from_encoding='utf-8')
    
    # 메인 콘텐츠 추출 시도
    main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
    
    if not main_content:
        main_content = soup.body
    
    # 이미지 추출
    images = []
    for img in main_content.find_all('img'):
        src = img.get('src', '')
        alt = img.get('alt', '')
        if src:
            images.append({"src": src, "alt": alt})
    
    # HTML을 마크다운으로 변환
    markdown = markdownify.markdownify(str(main_content))
    
    return {
        "markdown": markdown,
        "images": images
    }

async def _fetch_url_content(url: str, force_raw: bool = False) -> Dict[str, Any]:
    """URL을 가져와 콘텐츠를 반환합니다."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                url, 
                follow_redirects=True,
                headers={"User-Agent": DEFAULT_USER_AGENT}
            )
            response.raise_for_status()
            
            # 인코딩 감지 및 설정
            encoding = detect_encoding(response)
            response.headers.encoding = encoding
            
            content_type = response.headers.get("content-type", "").lower()
            text = response.text
            
            is_html = "<html" in text.lower() or "text/html" in content_type
            
            if is_html and not force_raw:
                try:
                    result = extract_content_from_html(text, url)
                    markdown = result["markdown"]
                    images = result["images"]
                    image_urls = [img["src"] for img in images]
                    
                    return {
                        "content": markdown,
                        "prefix": "",
                        "image_urls": image_urls,
                        "success": True
                    }
                except Exception as e:
                    logger.warning(f"HTML 처리 중 오류 발생: {e}, 원본 텍스트 반환")
                    return {
                        "content": text,
                        "prefix": "HTML 처리 중 오류가 발생했습니다. 원본 내용:\n",
                        "image_urls": [],
                        "success": True
                    }
            
            # JSON 또는 일반 텍스트 처리
            if "application/json" in content_type:
                return {
                    "content": json.dumps(response.json(), ensure_ascii=False, indent=2),
                    "prefix": "JSON 콘텐츠:\n",
                    "image_urls": [],
                    "success": True
                }
            else:
                return {
                    "content": text,
                    "prefix": f"콘텐츠 타입 {content_type}:\n",
                    "image_urls": [],
                    "success": True
                }
    except httpx.RequestError as e:
        return {
            "content": f"URL 요청 오류: {e}",
            "prefix": "오류 발생:\n",
            "image_urls": [],
            "success": False
        }
    except httpx.HTTPStatusError as e:
        return {
            "content": f"HTTP 상태 오류: {e.response.status_code} - {e}",
            "prefix": "오류 발생:\n",
            "image_urls": [],
            "success": False
        }
    except Exception as e:
        return {
            "content": f"오류 발생: {e}",
            "prefix": "예상치 못한 오류:\n",
            "image_urls": [],
            "success": False
        }

# --- 기존 fetch_url 도구 교체 ---
@mcp.tool(
    name="fetch_url",
    description="Fetches the content of a given URL. Attempts to convert HTML to markdown and extract images."
)
async def fetch_url(url: str, max_length: int = 20000, start_index: int = 0, raw: bool = False) -> str:
    """
    URL 콘텐츠 가져오기 도구
    
    주어진 URL의 내용을 가져와 HTML인 경우 마크다운으로 변환하고 이미지 URL도 추출합니다.
    
    Args:
        url: 가져올 URL
        max_length: 반환할 최대 콘텐츠 길이 (기본값: 20000)
        start_index: 콘텐츠 시작 인덱스 (기본값: 0)
        raw: HTML을 마크다운으로 변환하지 않고 원시 내용을 반환할지 여부 (기본값: False)
        
    Returns:
        str: 변환된 마크다운 콘텐츠 또는 원시 콘텐츠, 오류 발생 시 오류 메시지
    """
    try:
        result = await _fetch_url_content(url, raw)
        content = result["content"]
        prefix = result["prefix"]
        image_urls = result.get("image_urls", [])
        success = result.get("success", False)
        
        # 콘텐츠 길이 제한
        final_content = content
        if len(final_content) > max_length:
            final_content = final_content[start_index:start_index + max_length]
            final_content += f"\n\n<추가 내용이 잘렸습니다. 더 많은 내용을 보려면 start_index={start_index + max_length}로 다시 호출하세요.>"
        
        # 이미지 섹션 추가
        images_section = ""
        if image_urls and len(image_urls) > 0:
            images_section = "\n\n발견된 이미지:\n" + "\n".join([f"- {img}" for img in image_urls])
        
        if not success:
            return f"{prefix}{final_content}"
        else:
            return f"{prefix}{url} 내용:\n\n{final_content}{images_section}"
    
    except Exception as error:
        return f"URL 가져오기 오류: {str(error)}"

# --- 구글 검색 MCP 도구 ---
@mcp.tool()
async def search_google(query: str, num_results: int = 10) -> str:
    """
    구글 검색 도구
    
    구글 맞춤 검색 API를 사용하여 웹 검색을 수행합니다.
    
    Args:
        query: 검색어
        num_results: 반환할 결과 수 (기본값: 10)
        
    Returns:
        str: 검색 결과 문자열
    """
    try:
        # Google API 키 및 CSE ID 확인
        if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
            return "구글 검색 API가 구성되지 않았습니다. GOOGLE_API_KEY와 GOOGLE_CSE_ID 환경 변수를 설정하세요."
        
        # 구글 맞춤 검색 API 초기화
        service = build("customsearch", "v1", developerKey=GOOGLE_API_KEY)
        
        # 검색 실행
        result = service.cse().list(
            q=query,
            cx=GOOGLE_CSE_ID,
            num=num_results
        ).execute()
        
        # 검색 결과 포맷팅
        formatted_results = []
        if "items" in result:
            for item in result["items"]:
                formatted_results.append({
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", "")
                })
        
        # 결과 문자열 구성
        total_results = result.get("searchInformation", {}).get("totalResults", "0")
        response_text = f"구글 검색 결과 (총 {total_results}건):\n\n"
        
        for i, item in enumerate(formatted_results, 1):
            response_text += f"### 결과 {i}\n"
            response_text += f"제목: {item['title']}\n"
            response_text += f"링크: {item['link']}\n"
            response_text += f"설명: {item['snippet']}\n\n"
        
        if not formatted_results:
            response_text += "검색 결과가 없습니다."
        
        return response_text
    
    except HttpError as error:
        return f"API 오류: {str(error)}"
    except Exception as error:
        return f"오류 발생: {str(error)}"

# --- 메인 실행 코드 ---
if __name__ == "__main__":
    # API 키 확인
    if not API_KEY:
        logger.warning("DART_API_KEY 환경 변수가 설정되지 않았습니다. DART API 기능이 작동하지 않을 수 있습니다.")
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        logger.warning("NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다. 네이버 검색 기능이 작동하지 않을 수 있습니다.")
    if not GOOGLE_API_KEY or not GOOGLE_CSE_ID:
        logger.warning("GOOGLE_API_KEY 또는 GOOGLE_CSE_ID 환경 변수가 설정되지 않았습니다. 구글 검색 기능이 작동하지 않을 수 있습니다.")
    
    # 서버 실행
    logger.info("Company Analysis MCP Server 시작 중...")
    mcp.run()
