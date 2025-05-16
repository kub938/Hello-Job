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
