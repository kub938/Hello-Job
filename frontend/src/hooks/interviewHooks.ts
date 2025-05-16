import { interviewApi } from "@/api/interviewApi";
import {
  InterviewCategory,
  InterviewVideoQuestionRequest,
  SaveQuestionRequest,
} from "@/types/interviewApiTypes";
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

export const useSaveCoverLetterQuestions = () => {
  return useMutation({
    mutationKey: ["save-cover-letter-question"],
    mutationFn: async (selectQuestion: SaveQuestionRequest) => {
      const response = await interviewApi.saveQuestion(selectQuestion);
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data, "question 데이터 저장에 성공했습니다.");
    },
  });
};

export const useGetCoverLetterQuestions = (
  coverLetterId?: number | null | undefined
) => {
  return useQuery({
    queryKey: ["cover-letter-questions"],
    queryFn: async () => {
      if (coverLetterId === null) {
        return null;
      }
      const response = await interviewApi.getCoverLetterQuestions(
        coverLetterId
      );
      console.log(response);

      return response.data;
    },
  });
};

export const useSelectCategory = () => {
  return useMutation({
    mutationKey: ["select-category"],
    mutationFn: async (selectCategory: InterviewCategory) => {
      const response = await interviewApi.selectCategory(selectCategory);
      console.log(response.data);
      return response.data;
    },
  });
};

export const useSelectQuestionComplete = () => {
  return useMutation({
    mutationKey: ["select-question-complete"],
    mutationFn: async ({
      category,
      selectData,
    }: {
      category: InterviewCategory;
      selectData: InterviewVideoQuestionRequest;
    }) => {
      const response = await interviewApi.selectQuestionComplete(
        category,
        selectData
      );
      return response.data;
    },
  });
};

export const useStartInterview = () => {
  return useMutation({
    mutationKey: ["start-interview"],
    mutationFn: async ({
      category,
      coverLetterId,
    }: {
      category: InterviewCategory;
      coverLetterId?: number;
    }) => {
      const response = await interviewApi.startInterview(
        category,
        coverLetterId
      );
      return response.data;
    },
  });
};
