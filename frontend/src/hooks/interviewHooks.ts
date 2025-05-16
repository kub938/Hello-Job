import { interviewApi } from "@/api/interviewApi";
import { InterviewCategory } from "@/types/interviewApiTypes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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

export const useCompleteQuestion = () => {
  return useMutation({
    mutationKey: ["complete-question"],
    mutationFn: async ({
      interviewAnswerId,
      videoFile,
      audioFile,
    }: {
      interviewAnswerId: number;
      videoFile: File;
      audioFile: File;
    }) => {
      const response = await interviewApi.completeQuestion(
        interviewAnswerId,
        videoFile,
        audioFile
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("답변이 성공적으로 제출되었습니다!");
    },
    onError: () => {
      toast.error("답변 제출에 실패했습니다.");
    },
  });
};
