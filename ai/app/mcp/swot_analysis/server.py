#!/usr/bin/env python3
"""
MCP 기업 SWOT 분석 순차적 사고 서버

취업준비생을 위한 체계적인 기업 SWOT 분석 및 지원 전략 수립 도구입니다.
sequentialthinking.py와 swot_analysis.py의 장점을 결합했습니다.
"""

import json
import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from colorama import Fore, Style, init
from mcp.server.fastmcp import FastMCP
from mcp.types import Tool

# 터미널 색상 지원 초기화
init()


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
        
        # 기업명 표시
        if thought_data.companyName:
            header_parts.append(f"📊 {thought_data.companyName}")
            
        # 직무 표시
        if thought_data.jobPosition:
            header_parts.append(f"👔 {thought_data.jobPosition}")
            
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
        
        # 정보 출처 표시
        source_info = ""
        if thought_data.dataSource:
            source_text = "출처" if is_korean else "Source"
            source_info = f"\n│ 📚 {source_text}: {thought_data.dataSource} │"
        
        # 추천 질문 표시 (현재 단계에 맞는 첫 번째 질문만)
        prompt_info = ""
        if thought_data.analysisStage in self.stage_prompts and self.stage_prompts[thought_data.analysisStage]:
            prompt_text = "추천 질문" if is_korean else "Suggested Question"
            question = self.stage_prompts[thought_data.analysisStage][0]  # 첫 번째 질문만 표시
            prompt_info = f"\n│ 💡 {prompt_text}: {question} │"
        
        # 테두리 및 포맷팅
        header_len = len(" | ".join(header_parts) + context)
        # ANSI 색상 코드 길이 제외
        header_len -= len(stage_color) + len(Style.RESET_ALL)
        
        # 생각 내용 줄바꿈 처리 및 최대 길이 계산
        thought_lines = thought_data.thought.split('\n')
        max_thought_line_len = max(len(line) for line in thought_lines) if thought_lines else 0
        
        # 추가 정보 길이 계산
        source_len = len(source_info.replace("\n│ 📚 출처: ", "").replace(" │", "")) if source_info else 0
        prompt_len = len(prompt_info.replace("\n│ 💡 추천 질문: ", "").replace(" │", "")) if prompt_info else 0
        
        # 테두리 길이 계산 (모든 요소 중 가장 긴 것 + 여백)
        border_len = max(header_len, max_thought_line_len, source_len, prompt_len) + 4
        border = "─" * border_len

        # 최종 포맷팅된 출력 구성
        formatted_output = f"\n┌{border}┐\n"
        formatted_output += f"│ {header} {' ' * (border_len - header_len - 2)}│"
        
        if source_info:
            formatted_output += source_info
        if prompt_info:
            formatted_output += prompt_info
            
        formatted_output += f"\n├{border}┤\n"
        
        # 생각 내용 포맷팅
        for line in thought_lines:
            formatted_output += f"│ {line.ljust(border_len - 2)} │\n"
            
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

# 향상된 기업 SWOT 분석 도구 설명
ENHANCED_SWOT_DESCRIPTION = """향상된 취업 준비를 위한 기업 SWOT 분석 도구입니다.

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
- 단계별 추천 질문과 체크리스트 제공
- 분석 템플릿 제공으로 작성 용이
- 한국어/영어 전환 지원
- 외부 검색 도구(웹 검색, SWOT 분석 웹도구 등) 활용 권장

매개변수 설명:
- thought: 현재 분석 단계에서의 생각이나 통찰
- thoughtNumber: 현재 생각 번호 (최소값: 1)
- totalThoughts: 예상되는 총 생각 수 (최소값: 1)
- nextThoughtNeeded: 추가 생각이 필요한지 여부
- analysisStage: 현재 분석 단계 ('planning', 'S', 'W', 'O', 'T', 'synthesis', 'recommendation')
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

분석 프로세스:
1. 계획 수립 (planning):
   - 분석 대상 기업과 직무 명확화
   - 정보 수집 계획 수립
   - 분석 범위와 목표 설정
   - 웹 검색 등 외부 도구로 기초 자료 수집 (기업 홈페이지, 뉴스 기사, 투자자 정보 등)

2. 강점(S) 분석:
   - 기업의 시장 위치, 브랜드 가치, 기술력, 재무 상태
   - 핵심 제품/서비스의 경쟁 우위
   - 인재 구성 및 조직 문화의 강점
   - 특허, 지적 재산권, 독점 기술
   - 외부 도구로 최신 재무정보, 뉴스, 기업 보고서 참고

3. 약점(W) 분석:
   - 경쟁사 대비 부족한 부분
   - 내부 프로세스나 시스템의 비효율성
   - 인력, 기술, 자원의 제한점
   - 개선이 필요한 영역
   - 잡플래닛, 글래스도어 등의 외부 리뷰 사이트 참고

4. 기회(O) 분석:
   - 시장 성장 가능성 및 새로운 트렌드
   - 기술 발전으로 인한 새로운 기회
   - 경쟁사의 약점을 활용할 수 있는 영역
   - 규제 변화, 사회적 변화로 인한 기회

5. 위협(T) 분석:
   - 경쟁 심화 요인
   - 시장 변화 및 소비자 니즈 변화
   - 기술적, 법적 위협 요소
   - 경제, 정치적 리스크 요인

6. 종합 분석 (synthesis):
   - SWOT 요소들 간의 상호작용 분석
   - SO 전략: 강점을 활용하여 기회를 포착
   - WO 전략: 약점을 보완하여 기회를 활용
   - ST 전략: 강점을 활용하여 위협에 대응
   - WT 전략: 약점과 위협을 최소화
   - 핵심 통찰 요약 및 우선순위화
   - 기업의 전략적 방향성 파악

7. 지원 전략 (recommendation):
   - 자신의 강점과 기업 필요성 연결
   - 기업 문화 적합성 제시 방안
   - 면접 및 자기소개서 차별화 전략
   - 입사 후 기여 방안 구체화
   - 핵심 경력 강점과 기업 약점/기회 연결

사용 방법:
1. 분석할 기업과 지원 직무를 명확히 설정
2. 'planning' 단계부터 시작하여 각 단계별로 체계적인 분석 진행
3. 각 단계에서 제공되는 추천 질문과 템플릿 활용
4. 필요시 웹 검색, 뉴스 검색, 기업정보 사이트 등 외부 도구 활용
5. 이전 분석을 수정하거나 대안적 관점 탐색
6. 종합적인 결론과 개인화된 지원 전략 수립
7. 면접과 자기소개서에 활용할 핵심 포인트 정리

이 도구는 취업 준비생이 자신의 경력과 역량을 기업의 상황과 연결하여 
차별화된 지원 전략을 수립할 수 있도록 지원합니다.

[참고] 외부 검색 도구 활용법:
분석 과정에서 기업 정보가 필요한 경우 다음 외부 도구를 활용하는 것이 좋습니다:
- 구글 검색(google-search)
- 네이버 검색(search-webkr)
- 네이버 뉴스(search-news)"""


def main():
    """향상된 기업 SWOT 분석 MCP 서버 실행."""
    print("SWOT 분석 MCP 서버 시작 중...", file=sys.stderr)
    
    # FastMCP 서버 인스턴스 생성
    mcp = FastMCP(
        "enhanced-swot-analysis-server", 
        version="1.0.0"
    )
    
    swot_server = EnhancedSWOTServer()
    
    # 도구 등록 - FastMCP 데코레이터 스타일
    @mcp.tool(
        name="swot_analysis",
        description=ENHANCED_SWOT_DESCRIPTION
    )
    def swot_analysis(
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
        languagePreference: str = None
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
            
        return swot_server.process_thought(input_data)
    
    # 서버 시작 - FastMCP는 기본적으로 stdio를 사용
    try:
        mcp.run()
    except KeyboardInterrupt:
        print("사용자에 의해 서버가 중지되었습니다", file=sys.stderr)
    except Exception as e:
        print(f"서버 실행 중 치명적 오류 발생: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main() 