import {
  CoverLetterPostRequest,
  getCoverLetterContentIdsResponse,
} from "@/types/coverLetterTypes";
import { authApi } from "./instance";
import {
  getContentStatusResponse,
  getCoverLetterResponse,
  SaveCoverLetterRequest,
} from "@/types/coverLetterApiType";

interface sendMessageRequest {
  contentId: number;
  userMessage: string;
  contentDetail: string;
}

export interface postCoverLetterResponse {
  coverLetterId: number;
  firstContentId: number;
  message: string;
}
export const coverLetterApi = {
  postCoverLetter: (postCoverLetterRequest: CoverLetterPostRequest) => {
    return authApi.post<postCoverLetterResponse>(
      "/api/v1/cover-letter",
      postCoverLetterRequest
    );
  },
  getCoverLetter: (contentId: number) => {
    return authApi.get<getCoverLetterResponse>(
      `/api/v1/cover-letter-content/${contentId}`
    );
  },
  getCoverLetterContentIds: (coverLetterId: number) => {
    return authApi.get<getCoverLetterContentIdsResponse>(
      `/api/v1/cover-letter/${coverLetterId}`
    );
  },

  sendMessage: (message: sendMessageRequest) => {
    return authApi.post(
      `/api/v1/cover-letter-content/${message.contentId}/chat`,
      {
        userMessage: message.userMessage,
        contentDetail: message.contentDetail,
      }
    );
  },

  getContentStatus: (coverLetterId: number) => {
    return authApi.get<getContentStatusResponse>(
      `/api/v1/cover-letter/status/${coverLetterId}`
    );
  },

  saveCoverLetter: (saveData: SaveCoverLetterRequest) => {
    return authApi.patch(`/api/v1/cover-letter-content/${saveData.contentId}`, {
      contentDetail: saveData.contentDetail,
      contentStatus: saveData.contentStatus,
    });
  },
  deleteCoverLetter: (coverLetterId: number) => {
    return authApi.delete(`/api/v1/cover-letter/${coverLetterId}`);
  },
};
