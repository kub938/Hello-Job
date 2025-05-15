import { interviewApi } from "@/api/interviewApi";
import { InterviewCategory } from "@/types/interviewApiTypes";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetQuestions = (category: InterviewCategory) => {
  return useQuery({
    queryKey: ["questions", category],
    queryFn: async () => {
      const response = await interviewApi.getQuestions(category);
      return response.data;
    },
  });
};

export const useCreateCoverLetterQuestion = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-cover-letter-question"],
    mutationFn: async (coverLetterId: number) => {
      const response = await interviewApi.createQuestion(coverLetterId);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data, "question 데이터 생성에 성공했습니다.");
      // queryClient.invalidateQueries([]);
    },
  });
};
