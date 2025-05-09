// 자기소개서 본문 내용 인터페이스
export interface CoverLetterContent {
  contentId: number; // 본문 id
  contentNumber: number; // 번호
  contentQuestion: string; // 질문
  contentDetail: string; // 본문
  contentLength: number; // 글자수
}

// 자기소개서 상세 응답 인터페이스
export interface GetCoverLetterDetailResponse {
  coverLetterId: number; // 전체 자기소개서 id
  contents: CoverLetterContent[]; // 자기소개서 내용 배열
  finish: boolean; // 자기소개서 작성 완료 여부
  updatedAt: string;
}
