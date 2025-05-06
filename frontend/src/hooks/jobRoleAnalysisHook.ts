import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import { JobBookMarkResponse } from "@/types/coverLetterTypes";
import { useQuery } from "@tanstack/react-query";

export const useGetJobBookMarks = (companyId: number) => {
  return useQuery<JobBookMarkResponse[], Error>({
    queryKey: ["jobBookMark", companyId],
    queryFn: async () => {
      const response = await jobRoleAnalysis.getJobBookMarks(companyId);
      return response.data;
    },
  });
};
