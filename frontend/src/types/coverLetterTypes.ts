import { ContentStatus } from "./coverLetterApiType";

export interface QuestionStepProps {
  selectQuestionNumber: number;
  QuestionStatuses: ContentStatus[];
  handleSelectQuestion: (selectId: number, selectNum: number) => void;
  selectQuestion: number;
}

// export interface CoverLetterSummaryType {
//   totalContentQuestionCount: number;
//   contentQuestionStatuses: QuestionStatus[];
//   companyAnalysisId: number;
//   jobRoleSnapshotId: number;
//   coverLetterUpdatedAt: string;
// }

// export interface CoverLetterResponse {
//   coverLetterId: number;
//   summary: CoverLetterSummaryType;
//   content: CoverLetterContentType;
// }

//Post Request Type
export interface CoverLetterPostRequest {
  coverLetterTitle: string;
  companyAnalysisId: number | null;
  jobRoleAnalysisId: number | null;
  contents: CoverLetterRequestContent[];
}

export interface CoverLetterRequestContent {
  contentQuestion: string;
  contentNumber: number;
  contentExperienceIds: number[];
  contentProjectIds: number[];
  contentLength: number;
  contentFirstPrompt: string;
}

export interface ReportListProps {
  nowStep: number;
}

// bookMark 타입
export interface JobBookMarkResponse {
  jobRoleAnalysisId: number;
  companyName: string;
  jobRoleName: string;
  jobRoleAnalysisTitle: string;
  jobRoleCategory: string;
  jobRoleViewCount: number;
  jobRoleBookmarkCount: number;
  bookmark: boolean;
  updatedAt: string;
  public: boolean;
}

export interface CompanyBookMarkResponse {
  companyAnalysisBookmarkId: number;
  companyAnalysisId: number;
  companyName: string;
  createdAt: string;
  companyViewCount: number;
  companyLocation: string;
  companySize: string;
  companyIndustry: string;
  companyAnalysisBookmarkCount: number;
  bookmark: boolean;
  public: boolean;
}

export interface getCoverLetterContentIdsResponse {
  coverLetterTitle: string;
  contentIds: number[];
  companyAnalysisId: number; // 기업 분석 id
  jobRoleSnapshotId: number; //
}
