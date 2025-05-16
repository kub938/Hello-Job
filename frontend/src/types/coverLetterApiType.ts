import { ChatMessage } from "./coverLetterStoreTypes";

export type ContentQuestionStatusType = "COMPLETED" | "IN_PROGRESS" | "PENDING";

export interface ContentStatus {
  contentId: number;
  contentNumber: number;
  contentStatus: ContentQuestionStatusType;
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
  contentChatLog: ChatMessage[];
  contentUpdatedAt: string;
}

export type SenderType = "AI" | "USER";

export interface QuestionStatus {
  contentNumber: number;
  contentStatus: ContentQuestionStatusType;
}

export interface SaveCoverLetterRequest {
  contentId: number;
  contentDetail: string;
  contentStatus: ContentQuestionStatusType;
}
