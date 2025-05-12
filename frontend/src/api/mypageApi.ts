import {
  GetCoverLetterDetailResponse,
  GetCoverLetterListResponse,
  GetMyExperienceListResponse,
  GetMyProjectListResponse,
} from "@/types/mypage";
import { authApi } from "./instance";
import {
  CompanyBookMarkResponse,
  JobBookMarkResponse,
} from "@/types/coverLetterTypes";

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

export const getMyProjectList = (page: number) => {
  return authApi.get<GetMyProjectListResponse>(
    `/api/v1/mypage/project?page=${page}`
  );
};

export const getMyExperienceList = (page: number) => {
  return authApi.get<GetMyExperienceListResponse>(
    `/api/v1/mypage/experience?page=${page}`
  );
};

export const getCompanyBookMarksAll = () => {
  return authApi.get<CompanyBookMarkResponse[]>(
    "/api/v1/company-analysis/bookmark"
  );
};

export const getJobBookMarksAll = () => {
  return authApi.get<JobBookMarkResponse[]>(
    `/api/v1/job-role-analysis/bookmark`
  );
};
