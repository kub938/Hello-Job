import { api } from "./api";

export const getCompanies = (companyName: string) => {
  return api.get("/api/v1/company/search", {
    params: { companyName },
  });
};

export const companyAnalysisApi = {
  getCompanyAnalyses: () => {
    return api.get("/api/v1/company-analysis/all-analysis");
  },

  getCompanyBookMarks: (companyId: number) => {
    return api.get(`/api/v1/company-analysis/bookmark?companyId=${companyId}`);
  },
};
