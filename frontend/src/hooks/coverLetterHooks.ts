import { coverLetterApi } from "@/api/coverLetterApi";
import { CoverLetterPostRequest } from "@/types/coverLetterTypes";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetCoverLetter = (
  coverLetterId: number,
  coverLetterNumber: number
) => {
  return useQuery({
    queryKey: ["cover-letter-number", "cover-letter"],
    queryFn: async () => {
      const response = await coverLetterApi.getCoverLetter(
        coverLetterId,
        coverLetterNumber
      );
      return response;
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
