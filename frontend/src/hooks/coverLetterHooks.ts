import { coverLetterApi } from "@/api/coverLetterApi";
import { SaveCoverLetterRequest } from "@/types/coverLetterApiType";
import {
  CoverLetterPostRequest,
  getCoverLetterContentIdsResponse,
} from "@/types/coverLetterTypes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useGetCoverLetter = (contentId: number) => {
  return useQuery({
    queryKey: ["cover-letter-number", "cover-letter", contentId],
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
    onError: (error: AxiosError) => {
      if (error.response?.status === 503) {
        console.error(
          "서버가 일시적으로 사용 불가합니다. 잠시 후 다시 시도해주세요.",
          error
        );
        toast.error(
          "서버가 일시적으로 사용 불가합니다. 잠시 후 다시 시도해주세요."
        );
      } else {
        console.error(
          "메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요",
          error
        );
        toast.error("메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요");
      }
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
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useSaveCoverLetter = () => {
  return useMutation({
    mutationKey: [],
    mutationFn: async (saveData: SaveCoverLetterRequest) => {
      const response = await coverLetterApi.saveCoverLetter(saveData);
      return response.data;
    },
  });
};
