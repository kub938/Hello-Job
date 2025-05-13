import {
  experienceApi,
  GetExperienceResponse,
  PostExperienceRequest,
} from "@/api/experienceApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetExperiences = () => {
  return useQuery<GetExperienceResponse[]>({
    queryKey: ["experiences"],
    queryFn: async () => {
      const response = await experienceApi.getExperiences();
      return response.data;
    },
  });
};

export const usePostExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["experienceFormData"],
    mutationFn: async (experienceFormData: PostExperienceRequest) => {
      const response = await experienceApi.postExperience(experienceFormData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
    },
  });
};
