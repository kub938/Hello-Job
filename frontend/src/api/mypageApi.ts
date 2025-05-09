import { authApi } from "./instance";

export const getCoverLetterDetail = (coverLetterId: string) => {
  return authApi.get(`/api/v1/mypage/cover-letter/${coverLetterId}`);
};
