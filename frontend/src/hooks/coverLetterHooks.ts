import { coverLetterApi } from "@/api/coverLetterApi";
import { SaveCoverLetterRequest } from "@/types/coverLetterApiType";
import {
  CoverLetterPostRequest,
  getCoverLetterContentIdsResponse,
} from "@/types/coverLetterTypes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

// 특정 coverLetter의 contentIds를 가져오는 쿼리 훅
export const useGetCoverLetterContentIds = (coverLetterId: number) => {
  return useQuery<getCoverLetterContentIdsResponse>({
    queryKey: ["cover-letter-content-ids", coverLetterId],
    queryFn: async () => {
      const response = await coverLetterApi.getCoverLetterContentIds(
        coverLetterId
      );
      return response.data;
    },
  });
};

// contentId를 사용하여 특정 coverLetter를 가져오는 쿼리 훅
export const useGetCoverLetter = (contentId: number | undefined) => {
  return useQuery({
    queryKey: ["cover-letter-number", "cover-letter", contentId],
    queryFn: async () => {
      if (contentId === undefined) {
        throw new Error("Content ID is undefined");
      }
      const response = await coverLetterApi.getCoverLetter(contentId);
      return response.data;
    },
    // contentId가 유효한 값인 경우에만 쿼리 실행
    enabled: contentId !== undefined,
  });
};

// 두 쿼리를 연결하여 사용하는 복합 훅
export const useGetFirstCoverLetter = (
  coverLetterId: number,
  selectContentNumber: number
) => {
  // 1. 먼저 contentIds 목록을 가져옴
  const contentIdsQuery = useGetCoverLetterContentIds(coverLetterId);

  // 2. contentIds 중 첫 번째 항목(0번 인덱스)을 사용하여 coverLetter 가져오기
  const firstContentId =
    contentIdsQuery.data?.contentIds?.[selectContentNumber];

  const coverLetterQuery = useGetCoverLetter(firstContentId);

  console.log(coverLetterQuery.data);
  return {
    contentIdsQuery,
    coverLetterQuery,
    // 두 쿼리의 상태를 조합하여 전체 상태 제공
    isLoading: contentIdsQuery.isLoading || coverLetterQuery.isLoading,
    isError: contentIdsQuery.isError || coverLetterQuery.isError,
    error: contentIdsQuery.error || coverLetterQuery.error,
    data: coverLetterQuery.data,
  };
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
