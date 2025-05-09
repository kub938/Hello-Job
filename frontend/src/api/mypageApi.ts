import { authApi } from "./instance";

export const getCoverLetterDetail = (coverLetterId: string) => {
  return authApi.get(`/api/v1/mypage/cover-letter/${coverLetterId}`);
};

export const getCoverLetterList = (page: number) => {
  return authApi.get(`/api/v1/mypage/cover-letter?page=${page}`);
};
