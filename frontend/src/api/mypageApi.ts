import {
  DeleteCoverLetterResponse,
  GetCoverLetterDetailResponse,
  GetCoverLetterListResponse,
  GetMyExperienceDetailResponse,
  GetMyExperienceListResponse,
  GetMyProjectDetailResponse,
  GetMyProjectListResponse,
  GetTokenResponse,
  UpdateMyExperienceRequest,
  UpdateMyExperienceResponse,
  UpdateMyProjectRequest,
  UpdateMyProjectResponse,
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

export const deleteCoverLetter = (coverLetterId: number) => {
  return authApi.delete<DeleteCoverLetterResponse>(
    `/api/v1/cover-letter/${coverLetterId}`
  );
};

//나의 프로젝트
export const getMyProjectList = (page: number) => {
  return authApi.get<GetMyProjectListResponse>(
    `/api/v1/mypage/project?page=${page}`
  );
};
export const getMyProjectDetail = (projectId: number) => {
  return authApi.get<GetMyProjectDetailResponse>(
    `/api/v1/project/${projectId}`
  );
};
export const updateMyProject = (
  projectId: number,
  data: UpdateMyProjectRequest
) => {
  return authApi.put<UpdateMyProjectResponse>(
    `/api/v1/project/${projectId}`,
    data
  );
};
export const deleteMyProject = (projectId: number) => {
  return authApi.delete(`/api/v1/project/${projectId}`);
};

//나의 경험
export const getMyExperienceList = (page: number) => {
  return authApi.get<GetMyExperienceListResponse>(
    `/api/v1/mypage/experience?page=${page}`
  );
};
export const getMyExperienceDetail = (experienceId: number) => {
  return authApi.get<GetMyExperienceDetailResponse>(
    `/api/v1/experience/${experienceId}`
  );
};
export const updateMyExperience = (
  experienceId: number,
  data: UpdateMyExperienceRequest
) => {
  return authApi.put<UpdateMyExperienceResponse>(
    `/api/v1/experience/${experienceId}`,
    data
  );
};
export const deleteMyExperience = (experienceId: number) => {
  return authApi.delete(`/api/v1/experience/${experienceId}`);
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

export const getToken = () => {
  return authApi.get<GetTokenResponse>(`/api/v1/user/token`);
};
