// 자기소개서 본문 내용 인터페이스
export interface CoverLetterContent {
  contentId: number; // 본문 id
  contentNumber: number; // 번호
  contentQuestion: string; // 질문
  contentDetail: string; // 본문
  contentLength: number; // 글자수
}

// 자기소개서 상세 응답 인터페이스
export interface GetCoverLetterDetailResponse {
  coverLetterId: number; // 전체 자기소개서 id
  contents: CoverLetterContent[]; // 자기소개서 내용 배열
  finish: boolean; // 자기소개서 작성 완료 여부
  updatedAt: string;
}

//자기소개서 목록 배열 인터페이스
export interface CoverLetterList {
  coverLetterId: number;
  coverLetterTitle: string;
  firstContentDetail: string;
  companyName: string;
  jobRoleName: string;
  jobRoleCategory: string;
  finish: boolean;
  updatedAt: string;
}

// 자기소개서 목록 응답 인터페이스
export interface GetCoverLetterListResponse {
  content: CoverLetterList[];
  // pageable 관련
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean; // 정렬 조건이 비어있는지
      sorted: boolean; // 정렬이 적용됐는지
      unsorted: boolean; // 정렬이 적용 안됐는지
    };
    offset: number; // SQL 기준 offset 값 (page * size)
    paged: boolean; // 페이징 요청이 적용되었는지
    unpaged: boolean; // 페이징 안 쓰는 요청인지
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number; // 현재 페이지에 남긴 데이터 개수
  empty: boolean; // 현재 페이지 데이터가 비어있는지 여부
}

// 내 프로젝트 불러오기기
export interface MyProject {
  projectId: number;
  projectName: string;
  projectIntro: string;
  projectSkills: string;
  updatedAt: string;
}

export interface GetMyProjectListResponse {
  content: MyProject[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

export interface GetMyProjectDetailResponse {
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

export interface UpdateMyProjectRequest {
  projectName: string;
  projectIntro: string;
  projectRole: string;
  projectSkills: string; // ", "(쉼표 + 띄어쓰기)로 구분
  projectStartDate: string;
  projectEndDate: string;
  projectDetail: string;
  projectClient: string;
}
export interface UpdateMyProjectResponse {
  message: string;
}

export interface DeleteMyProjectResponse {
  message: string;
}

// 내 경험 불러오기
export interface MyExperience {
  experienceId: number;
  experienceName: string;
  experienceRole: string;
  updatedAt: string;
}

export interface GetMyExperienceListResponse {
  content: MyExperience[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  empty: boolean;
}

export interface GetMyExperienceDetailResponse {
  experienceId: number;
  experienceName: string;
  experienceDetail: string;
  experienceRole: string;
  experienceStartDate: string;
  experienceEndDate: string;
  experienceClient: string;
  updatedAt: string;
}

export interface UpdateMyExperienceRequest {
  experienceName: string;
  experienceDetail: string;
  experienceRole: string;
  experienceStartDate: string;
  experienceEndDate: string;
  experienceClient: string;
}
export interface UpdateMyExperienceResponse {
  message: string;
}
export interface DeleteMyExperienceResponse {
  message: string;
}

export interface GetTokenResponse {
  token: number;
}
