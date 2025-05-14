import { interviewApi } from "@/api/interviewApi";
import { InterviewCategory } from "@/types/interviewApiTypes";
import { useQuery } from "@tanstack/react-query";

export const useGetQuestions = (category: InterviewCategory) => {
  return useQuery({
    queryKey: ["questions", category],
    queryFn: async () => {
      const response = await interviewApi.getQuestions(category);
      return response.data;
    },
  });
};
