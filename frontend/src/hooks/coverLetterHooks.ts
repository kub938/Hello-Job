import { coverLetterApi } from "@/api/coverLetterApi";
import {
  CoverLetterPostRequest,
  getCoverLetterContentIdsResponse,
} from "@/types/coverLetterTypes";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetCoverLetter = (contentId: number) => {
  return useQuery({
    queryKey: ["cover-letter-number", "cover-letter"],
    queryFn: async () => {
      const response = await coverLetterApi.getCoverLetter(contentId);
      console.log(response);
      return response.data;
    },
  });
};

export const useCreateCoverLetter = () => {
  return useMutation({
    mutationKey: ["create-cover-letter"],
    mutationFn: async (inputData: CoverLetterPostRequest) => {
      const response = await coverLetterApi.postCoverLetter(inputData);
      return response.data;
    },
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationKey: ["send-message"],
    mutationFn: async (message: {
      contentId: number;
      userMessage: string;
      contentDetail: string;
    }) => {
      const response = await coverLetterApi.sendMessage(message);
      return response.data;
    },
  });
};

export const useGetCoverLetterContentIds = (coverLetterId: number) => {
  return useQuery<getCoverLetterContentIdsResponse>({
    queryKey: ["cover-letter-content-ids", coverLetterId],
    queryFn: async () => {
      const response = await coverLetterApi.getCoverLetterContentIds(
        coverLetterId
      );
      return response.data; // API 응답에서 data 속성 반환
    },
  });
};

export const useGetContentStatus = (coverLetterId: number) => {
  return useQuery({
    queryKey: ["cover-letter-status"],
    queryFn: async () => {
      const response = await coverLetterApi.getContentStatus(coverLetterId);
      console.log(response.data);
      return response.data;
    },
  });
};
