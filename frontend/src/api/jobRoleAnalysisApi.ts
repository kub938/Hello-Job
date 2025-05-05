import { authApi } from "./instance";

export const jobRoleAnalysis = {
  getJobDetail: (jobRoleAnalysisId: number) => {
    return authApi.get(`/api/v1/job_role_analysis/${jobRoleAnalysisId}`);
  },

  getJobBookMarks: (companyId: number) => {
    return authApi.get(`/api/v1/job_role_analysis/bookmark`, {
      params: { companyId },
    });
  },
};
