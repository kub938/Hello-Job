export type ContentQuestionStatusType = "COMPLETED" | "IN_PROGRESS" | "PENDING";

export interface ContentStatus {
  contentId: number;
  contentNumber: number;
  contentStatus: string;
}
export interface getContentStatusResponse {
  coverLetterId: number;
  totalContentQuestionCount: number;
  contentQuestionStatuses: ContentStatus[];
  updatedAt: string;
}

export interface getCoverLetterResponse {
  contentId: number;
  contentQuestion: string;
  contentNumber: number;
  contentLength: number;
  contentDetail: string;
  contentExperienceIds: number[];
  contentProjectIds: number[];
  contentFirstPrompt: string;
  contentChatLog: ContentChatLogType[];
  contentUpdatedAt: string;
}

export interface ContentChatLogType {
  sender: SenderType;
  message: string;
}

export type SenderType = "AI" | "USER";

export interface QuestionStatus {
  contentNumber: number;
  contentStatus: ContentQuestionStatusType;
}
