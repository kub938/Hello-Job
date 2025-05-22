import { getCompanyDetailResponse } from "@/types/coporateResearch";
import { authApi } from "./instance";

export const companyApi = {
  // getCompanyAnalyses: () => {
  //   return authApi.get("/api/v1/company-analysis/all-analysis");
  // },

  getCompanyBookMarks: (companyId: number) => {
    return authApi.get("/api/v1/company-analysis/bookmark", {
      params: { companyId },
    });
  },

  getCompanies: (companyName: string) => {
    return authApi.get("/api/v1/company/search", {
      params: { companyName },
    });
  },

  getCompanyDetail: (companyId: number) => {
    return authApi.get<getCompanyDetailResponse>(
      `/api/v1/company/${companyId}`
    );
  },
};
