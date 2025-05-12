import { getToken } from "@/api/mypageApi";
import { useQuery } from "@tanstack/react-query";

export const useGetToken = (enabled: boolean) => {
  return useQuery({
    queryKey: ["token"],
    queryFn: async () => {
      const response = await getToken();
      return response.data;
    },
    enabled: enabled,
  });
};
