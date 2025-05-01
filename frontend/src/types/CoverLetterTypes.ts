export type ContentQuestionStatusType = "COMPLETED" | "IN_PROGRESS" | "PENDING";
export type SenderType = "AI" | "USER";

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

export interface ContentChatLogType {
  sender: SenderType;
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

//Post Request Type
export interface CoverLetterPostRequest {
  companyAnalysisId: number;
  jobRoleAnalysisId: number;
  contents: CoverLetterRequestContent;
}

export interface CoverLetterRequestContent {
  contentQuestion: string;
  contentNumber: number;
  contentExperienceIds: number[];
  contentProjectIds: number[];
  contentLength: number;
  contentFirstPrompt: string;
}

export type ChatMessage = {
  sender: "USER" | "AI";
  message: string;
};

export type ChatStore = {
  chatLog: ChatMessage[];
  addUserMessage: (message: string) => void;
};
