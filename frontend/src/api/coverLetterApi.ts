import {
  CoverLetterPostRequest,
  getCoverLetterContentIdsResponse,
} from "@/types/coverLetterTypes";
import { authApi } from "./instance";

interface sendMessageRequest {
  contentId: number;
  userMessage: string;
  contentDetail: string;
}

export const coverLetterApi = {
  postCoverLetter: (postCoverLetterRequest: CoverLetterPostRequest) => {
    return authApi.post("/api/v1/cover-letter", postCoverLetterRequest);
  },

  getCoverLetter: (contentId: number) => {
    return authApi.get(`/api/v1/cover-letter-content/${contentId}`);
  },

  getCoverLetterContentIds: (coverLetterId: number) => {
    return authApi.get<getCoverLetterContentIdsResponse>(
      `/api/v1/cover-letter/${coverLetterId}`
    );
  },

  draftCoverLetter: (coverLetterId: number, coverLetterNumber: number) => {
    return authApi.patch(
      `/api/v1/cover-letter/${coverLetterId}/${coverLetterNumber}`
    );
  },
  saveCoverLetter: (coverLetterId: number) => {
    return authApi.patch(`/api/v1/cover-letter/${coverLetterId}`);
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
  deleteCoverLetter: (coverLetterId: number) => {
    return authApi.delete(`/api/v1/cover-letter/${coverLetterId}`);
  },
  getConnectAnalysisInfo: (
    CoverLetterId: number,
    jobRoleSnapshotId: number
  ) => {
    return authApi.get(
      `/api/v1/cover-letter/${CoverLetterId}/${jobRoleSnapshotId}`
    );
  },
};
