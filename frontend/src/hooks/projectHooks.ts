import { projectApi } from "@/api/projectApi";
import { PostProjectRequest } from "@/types/projectApiTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

export interface GetProjectsResponse {
  projectId: number;
  projectName: string;
  projectIntro: string;
  projectSkills: string;
  updatedAt: string;
}
export const useGetProjects = () => {
  return useQuery<GetProjectsResponse[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectApi.getProjects();
      return response.data;
    },
  });
};

export const usePostProject = () => {
  return useMutation({
    mutationKey: ["postProject"],
    mutationFn: async (projectFormData: PostProjectRequest) => {
      const response = await projectApi.postProject(projectFormData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
