import {
  getAllJobList,
  getJobRoleDetail,
  postJobBookmarkRequest,
  postJobRoleAnalysisRequest,
  putJobRoleAnalysisRequest,
  putJobRoleAnalysisResponse,
} from "@/types/jobResearch";
import { api } from "./api";
import { authApi } from "./instance";

export const jobRoleAnalysis = {
  getJobDetail: (jobRoleAnalysisId: number) => {
    return authApi.get<getJobRoleDetail>(
      `/api/v1/job-role-analysis/${jobRoleAnalysisId}`
    );
  },

  getAllJobList: (companyId: number, jobRoleCategory?: string) => {
    return authApi.get<getAllJobList[]>(
      `/api/v1/job-role-analysis/${companyId}/search`,
      { params: { jobRoleCategory } }
    );
  },

  getJobBookMarks: (companyId: number) => {
    return api.get(`/api/v1/job-role-analysis/bookmark`, {
      params: { companyId },
    });
  },

  postBookmark: (postJobBookmarkRequest: postJobBookmarkRequest) => {
    return authApi.post(
      `/api/v1/job-role-analysis/bookmark`,
      postJobBookmarkRequest
    );
  },
  deleteBookmark: (jobRoleAnalysisBookmarkId: number) => {
    return authApi.delete(
      `/api/v1/job-role-analysis/bookmark/${jobRoleAnalysisBookmarkId}`
    );
  },

  postJobRoleAnalysis: (
    postJobRoleAnalysisRequest: postJobRoleAnalysisRequest
  ) => {
    return authApi.post(
      `/api/v1/job-role-analysis`,
      postJobRoleAnalysisRequest
    );
  },

  putJobRoleAnalysis: (
    putJobRoleAnalysisRequest: putJobRoleAnalysisRequest
  ) => {
    return authApi.put<putJobRoleAnalysisResponse>(
      `/api/v1/job-role-analysis`,
      putJobRoleAnalysisRequest
    );
  },

  deleteJobRoleAnalysis: (jobRoleAnalysisId: number) => {
    return authApi.delete(`/api/v1/job-role-analysis/${jobRoleAnalysisId}`);
  },
};
