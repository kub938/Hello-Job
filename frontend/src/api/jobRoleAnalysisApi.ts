import { api } from "./api";

export const jobRoleAnalysis = {
  getJobDetail: (jobRoleAnalysisId: number) => {
    return api.get(`/api/v1/job_role_analysis/${jobRoleAnalysisId}`);
  },

  getJobBookMarks: (companyId: number) => {
    return api.get(`/api/v1/job_role_analysis/bookmark`, {
      params: { companyId },
    });
  },
};
