import { CoverLetterPostRequest } from "@/types/CoverLetterTypes";
import { api } from "./api";

export const CoverLetterApi = {
  postCoverLetter: (postCoverLetterRequest: CoverLetterPostRequest) => {
    return api.post("/api/v1/cover-letter", { postCoverLetterRequest });
  },
  getCoverLetter: (coverLetterId: number, coverLetterNumber: number) => {
    return api.get(
      `/api/v1/cover-letter/${coverLetterId}/${coverLetterNumber}`
    );
  },

  draftCoverLetter: (coverLetterId: number, coverLetterNumber: number) => {
    return api.patch(
      `/api/v1/cover-letter/${coverLetterId}/${coverLetterNumber}`
    );
  },
  saveCoverLetter: (coverLetterId: number) => {
    return api.patch(`/api/v1/cover-letter/${coverLetterId}`);
  },
  sendMessage: (coverLetterId: number, coverLetterNumber: number) => {
    return api.post(
      `/api/v1/cover-letter/${coverLetterId}/${coverLetterNumber}/chat`
    );
  },
  deleteCoverLetter: (coverLetterId: number) => {
    return api.delete(`/api/v1/cover-letter/${coverLetterId}`);
  },
  getConnectAnalysisInfo: (
    CoverLetterId: number,
    jobRoleSnapshotId: number
  ) => {
    return api.get(
      `/api/v1/cover-letter/${CoverLetterId}/${jobRoleSnapshotId}`
    );
  },
};
