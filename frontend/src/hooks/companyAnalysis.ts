import { corporateReportApi } from "@/api/corporateReport";
import { useQuery } from "@tanstack/react-query";

export const useGetCompanyAnalyses = (companyId: number) => {
  return useQuery({
    queryKey: ["companyAnalyses", companyId],
    queryFn: async () => {
      const response = await corporateReportApi.getCorporateReportList(
        companyId
      );
      return response.data;
    },
  });
};
