import {
  GetCoverLetterDetailResponse,
  GetCoverLetterListResponse,
} from "@/types/mypage";
import { authApi } from "./instance";

export const getCoverLetterDetail = (coverLetterId: string) => {
  return authApi.get<GetCoverLetterDetailResponse>(
    `/api/v1/mypage/cover-letter/${coverLetterId}`
  );
};

export const getCoverLetterList = (page: number) => {
  return authApi.get<GetCoverLetterListResponse>(
    `/api/v1/mypage/cover-letter?page=${page}`
  );
};
