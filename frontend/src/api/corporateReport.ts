import { authApi } from "./instance";

export const corporateReportApi = {
  getCorporateReportList: (companyId: number) => {
    return authApi.get(`/api/v1/company-analysis/search/${companyId}`);
  },
};
