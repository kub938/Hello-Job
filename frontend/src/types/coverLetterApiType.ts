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
