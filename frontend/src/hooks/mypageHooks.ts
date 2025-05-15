import { getCoverLetterDetail, getCoverLetterList } from "@/api/mypageApi";
import { useQuery } from "@tanstack/react-query";

export const useGetCoverLetterDetail = (id: string | number) => {
  return useQuery({
    queryKey: ["coverLetterDetailData", id],
    queryFn: async () => {
      const response = await getCoverLetterDetail(id.toString());
      return response.data;
    },
  });
};

export const useGetCoverLetterList = (page: number) => {
  return useQuery({
    queryKey: ["coverLetterList", page],
    queryFn: async () => {
      const response = await getCoverLetterList(Number(page));
      return response.data;
    },
  });
};
