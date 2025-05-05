import { getCompanies } from "@/api/companyApi";
import { useQuery } from "@tanstack/react-query";

interface GetCompaniesResponse {
  companyName: string;
  companyIndustry: string;
  companyLocation: string;
  companySize: string;
  id: number;
  updatedAt: string;
}

export const useGetCompanies = (companyName: string) => {
  return useQuery<GetCompaniesResponse[], Error>({
    queryKey: ["companyName", companyName],
    queryFn: async () => {
      const response = await getCompanies(companyName);
      return response.data;
    },
    // enabled: companyName.trim().length > 0,
  });
};
