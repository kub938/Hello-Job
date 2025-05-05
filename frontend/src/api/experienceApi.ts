import { api } from "./api";

export interface PostProjectRequest {
  projectName: string;
  projectIntro: string;
  projectRole: string;
  projectSkills: string;
  projectStartDate: string;
  projectEndDate: string;
  projectDetail: string;
  projectClient: string;
}

export interface PostProjectResponse {
  projectId: number;
  message: string;
}

export interface GetProjectsResponse {
  projectId: number;
  projectName: string;
  projectIntro: string;
  projectSkills: string;
  updatedAt: string;
}

export interface GetProjectResponse {
  projectId: number;
  projectName: string;
  projectIntro: string;
  projectRole: string;
  projectSkills: string;
  projectStartDate: string;
  projectEndDate: string;
  projectDetail: string;
  projectClient: string;
  updatedAt: string;
}
export const experienceApi = {
  postProject: (projectFormData: PostProjectRequest) => {
    return api.post("/api/v1/project", projectFormData);
  },
  getProjects: () => {
    return api.get("/api/v1/project");
  },
  getProject: (projectId: number) => {
    return api.get(`/api/v1/project/${projectId}`);
  },
  putProject: (projectFormData: PostProjectRequest, projectId: number) => {
    return api.put(`/api/v1/project/${projectId}`, projectFormData);
  },
  deleteProject: (projectId: number) => {
    return api.delete(`/api/v1/project/${projectId}`);
  },
};
