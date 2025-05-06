import { api } from "./api";
import { authApi } from "./instance";

export const jobRoleAnalysis = {
  getJobDetail: (jobRoleAnalysisId: number) => {
    return authApi.get(`/api/v1/job_role_analysis/${jobRoleAnalysisId}`);
  },

  getJobBookMarks: (companyId: number) => {
    return api.get(`/api/v1/job-role-analysis/bookmark`, {
      params: { companyId },
    });
  },
};
