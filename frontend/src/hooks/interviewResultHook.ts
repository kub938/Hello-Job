import { interviewResultApi } from "@/api/interviewApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetInterviewResult = () => {
  return useQuery({
    queryKey: ["interviewResultList"],
    queryFn: async () => {
      const response = await interviewResultApi.getInterviewList();
      return response.data;
    },
  });
};

export const useGetInterviewDetail = (interviewVideoId: number) => {
  return useQuery({
    queryKey: ["interviewResultDetail", interviewVideoId],
    queryFn: async () => {
      const response = await interviewResultApi.getInterviewDetail(
        interviewVideoId
      );
      return response.data;
    },
  });
};

export const useDeleteInterviewResult = (interviewVideoId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await interviewResultApi.deleteInterviewResult(
        interviewVideoId
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewResultList"] });
    },
  });
};
