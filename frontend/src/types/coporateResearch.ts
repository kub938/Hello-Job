//전체 기업 목록 API
export interface getCorporateListResponse {
  id: number;
  companyName: string;
  companyLocation: string;
  companySize: string;
  companyIndustry: string;
}

//북마크 추가 API
export interface postBookmarkRequest {
  companyAnalysisId: number;
}
export interface postBookmarkResponse {
  companyAnalysisBookmarkId: number;
  companyAnalysisId: number;
}

//특정 기업 분석 레포트 목록 API
export interface getCorporateReportListResponse {
  companyAnalysisId: number;
  companyName: string;
  createdAt: string;
  companyViewCount: number;
  companyLocation: string;
  companySize: string;
  companyIndustry: string;
  companyAnalysisBookmarkCount: number;
  bookmark: boolean;
  dartCategory: string[];
  public: boolean;
}

//특정 기업 분석 레포트 상세 API
export interface getCorporateReportDetailResponse {
  companyAnalysisId: number;
  companyName: string;
  createdAt: string;
  companyViewCount: number;
  companyLocation: string;
  companySize: string;
  companyIndustry: string;
  companyAnalysisBookmarkCount: number;
  bookmark: boolean;
  newsAnalysisData: string;
  newsAnalysisDate: string;
  newsAnalysisUrl: string[];
  dartBrand: string;
  dartCurrIssue: string;
  dartVision: string;
  dartFinancialSummery: string;
  dartCategory: string[];
  public: boolean;
}

//기업 분석 생성 API
export interface postCorporateReportRequest {
  companyId: number;
  isPublic: boolean;
  basic: boolean;
  plus: boolean;
  financial: boolean;
}

export interface postCorporateReportResponse {
  companyAnalysisId: number;
}
