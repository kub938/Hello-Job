//특정 기업의 전체 직무 분석 불러오기
export interface getAllJobList {
  jobRoleAnalysisId: number;
  jobRoleName: string;
  jobRoleAnalysisTitle: string;
  jobRoleCategory: JobRoleCategory;
  jobRoleViewCount: number;
  jobRoleBookmarkCount: number;
  bookmark: boolean;
  updatedAt: string;
  createdAt: string;
  public: boolean;
}

//상세 직무 정보보
export interface getJobRoleDetail {
  jobRoleAnalysisId: number;
  companyName: string;
  jobRoleName: string;
  jobRoleAnalysisTitle: string;
  jobRoleWork: string;
  jobRoleSkills: string;
  jobRoleRequirements: string;
  jobRolePreferences: string;
  jobRoleEtc: string;
  jobRoleViewCount: number;
  isPublic: boolean;
  jobRoleCategory: JobRoleCategory;
  createdAt: string;
  updatedAt: string;
  jobRoleAnalysisBookmarkCount: number;
  bookmark: boolean;
}

//북마크
export interface postJobBookmarkRequest {
  jobRoleAnalysisId: number;
}

export interface postJobBookmarkResponse {
  jobRoleAnalysisBookmarkId: number;
  jobRoleAnalysisId: number;
}

//직무 분석 생성
export interface postJobRoleAnalysisRequest {
  companyId: number;
  jobRoleName: string;
  jobRoleTitle: string;
  jobRoleSkills: string;
  jobRoleWork: string;
  jobRoleRequirements: string;
  jobRolePreferences: string;
  jobRoleEtc: string;
  jobRoleCategory: JobRoleCategory;
  isPublic: boolean;
}

export type JobRoleCategory =
  | "서버백엔드개발자"
  | "프론트엔드개발자"
  | "안드로이드개발자"
  | "iOS개발자"
  | "크로스플랫폼앱개발자"
  | "게임클라이언트개발자"
  | "게임서버개발자"
  | "DBA"
  | "빅데이터엔지니어"
  | "인공지능머신러닝"
  | "devops시스템엔지니어"
  | "정보보안침해대응"
  | "QA엔지니어"
  | "개발PM"
  | "HW펌웨어개발"
  | "SW솔루션"
  | "헬스테크"
  | "VRAR3D"
  | "블록체인"
  | "기술지원"
  | "기타";

export interface postJobRoleAnalysisResponse {
  jobRoleId: number;
}
