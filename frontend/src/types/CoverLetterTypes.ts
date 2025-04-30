export interface QuestionStatus {
  contentNumber: number;
  contentStatus: ContentQuestionStatusType;
}

export interface QuestionStepProps {
  QuestionStatuses: QuestionStatus[];
  handleSelectQuestion: (selectNum: number) => void;
  selectQuestion: number;
}

export interface QuestionStatus {
  contentNumber: number;
  contentStatus: ContentQuestionStatusType;
}

export type ContentQuestionStatusType = "COMPLETED" | "IN_PROGRESS" | "PENDING";

export interface ContentChatLogType {
  sender: string;
  message: string;
}

export interface CoverLetterContentType {
  contentQuestion: string;
  contentNumber: number;
  contentLength: number;
  contentDetail: string;
  contentExperienceIds: number[];
  contentProjectIds: number[];
  contentFirstPrompt: string;
  contentStatus: ContentQuestionStatusType;
  contentChatLog: ContentChatLogType[];
  contentUpdatedAt: string;
}
export interface CoverLetterSummaryType {
  totalContentQuestionCount: number;
  contentQuestionStatuses: QuestionStatus[];
  companyAnalysisId: number;
  jobRoleSnapshotId: number;
  coverLetterUpdatedAt: string;
}

export interface CoverLetterResponse {
  coverLetterId: number;
  summary: CoverLetterSummaryType;
  content: CoverLetterContentType;
}
