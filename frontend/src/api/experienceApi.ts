import { authApi } from "./instance";

// {
//   "experienceId": 7,
//   "experienceName": "테스트2",
//   "experienceRole": "싸피 교육생",
//   "updatedAt": "2025-04-28T20:56:46.235933"
// },

export interface PostExperienceRequest {
  experienceName: string;
  experienceDetail: string;
  experienceRole: string;
  experienceStartDate: string;
  experienceEndDate: string;
  experienceClient: string;
}

export interface GetExperienceResponse {
  experienceId: number;
  experienceName: string;
  experienceRole: string;
  updatedAt: string;
}

export const experienceApi = {
  postExperience: (projectFormData: PostExperienceRequest) => {
    return authApi.post("/api/v1/experience", projectFormData);
  },
  getExperiences: () => {
    return authApi.get<GetExperienceResponse[]>("/api/v1/experience");
  },
  getExperience: (experienceId: number) => {
    return authApi.get<GetExperienceResponse>(
      `/api/v1/experience/${experienceId}`
    );
  },
  putExperience: (
    projectFormData: PostExperienceRequest,
    experienceId: number
  ) => {
    return authApi.put(`/api/v1/experience/${experienceId}`, projectFormData);
  },
  deleteExperience: (experienceId: number) => {
    return authApi.delete(`/api/v1/experience/${experienceId}`);
  },
};
