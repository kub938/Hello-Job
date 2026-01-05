import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/v1/company-analysis/bookmark", () => {
    return HttpResponse.json([
      {
        companyAnalysisBookmarkId: 101,
        companyAnalysisId: 2497,
        companyAnalysisTitle: "2025 상반기 기업 분석 리포트",
        companyName: "토스",
        createdAt: "2025-01-05T11:30:00Z",
        companyViewCount: 1234,
        companyLocation: "서울특별시 강남구",
        companySize: "대기업",
        companyIndustry: "핀테크",
        companyAnalysisBookmarkCount: 87,
        bookmark: true,
        dartCategory: ["금융업", "전자금융업"],
        public: true,
      },
    ]);
  }),

  http.get("/api/v1/job-role-analysis/bookmark", () => {
    return HttpResponse.json([
      {
        jobRoleAnalysisId: 3051,
        companyName: "네이버",
        jobRoleName: "프론트 개발자",
        jobRoleAnalysisTitle: "2025 상반기 직무 분석 리포트",
        jobRoleCategory: "개발",
        jobRoleViewCount: 456,
        jobRoleBookmarkCount: 34,
        bookmark: true,
        updatedAt: "2025-02-10T09:15:00Z",
        public: true,
      },
    ]);
  }),

  http.get("/api/v1/project", () => {
    return HttpResponse.json([
      {
        projectId: 4098,
        projectName: "AI 기반 데이터 분석 플랫폼",
        projectIntro: "AI 기반 데이터 분석 플랫폼 개발 프로젝트",
        projectSkills: "Python, TensorFlow, Pandas",
        updatedAt: "2025-02-10T09:15:00Z",
      },
    ]);
  }),

  http.get("/api/v1/experience", () => {
    return HttpResponse.json([
      {
        experienceId: 1001,
        experienceName: "AI 기반 데이터 분석 플랫폼 개발",
        experienceRole: "백엔드 개발자",
        updatedAt: "2025-02-10T09:15:00Z",
      },
    ]);
  }),
];
