import {
  CompanyBookMarkResponse,
  JobBookMarkResponse,
  ReportListProps,
} from "@/types/coverLetterTypes";
import { useState } from "react";
import { useParams } from "react-router";

function ReportList({ nowStep }: ReportListProps) {
  const companyData = [
    {
      companyAnalysisBookmarkId: 1,
      companyAnalysisId: 1,
      companyName: "삼성전자",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 10,
      companyLocation: "서울특별시 강남구",
      companySize: "대기업",
      companyIndustry: "전자제품 제조업",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 4,
      companyName: "일이삼사오육칠팔구십",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 5,
      companyName: "무신사",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 123,
      companyName: "무신사",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 8,
      companyName: "무신사",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 9,
      companyName: "무신사",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 10,
      companyName: "무신사",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
    {
      companyAnalysisBookmarkId: 4,
      companyAnalysisId: 11,
      companyName: "무신사",
      createdAt: "2025-04-29T12:49:32",
      companyViewCount: 15,
      companyLocation: "서울특별시 성동구",
      companySize: "중견기업",
      companyIndustry: "온라인 패션 쇼핑몰",
      companyAnalysisBookmarkCount: 2,
      bookmark: true,
      public: true,
    },
  ];
  const jobData = [
    {
      jobRoleAnalysisId: 6,
      companyName: "야놀자",
      jobRoleName: "수정한거임",
      jobRoleAnalysisTitle: "수정한거임",
      jobRoleCategory: "프론트엔드_개발자",
      jobRoleViewCount: 0,
      jobRoleBookmarkCount: 0,
      bookmark: false,
      updatedAt: "2025-04-29T11:08:11.241433",
      public: true,
    },
    {
      jobRoleAnalysisId: 7,
      companyName: "야놀자",
      jobRoleName: "수정한거임",
      jobRoleAnalysisTitle: "수정한거임",
      jobRoleCategory: "프론트엔드_개발자",
      jobRoleViewCount: 3,
      jobRoleBookmarkCount: 0,
      bookmark: false,
      updatedAt: "2025-04-30T11:01:34.14763",
      public: true,
    },
  ];
  const param = useParams();
  const reportType = param;
  console.log(reportType);
  const reportBlockLayout =
    "p-5 border w-full rounded-2xl h-35 flex justify-center items-center cursor-pointer ";
  const hoverReportBlockLayout =
    "duration-100 hover:border-2 hover:border-primary hover:bg-secondary-light";
  const selectedStyle = "border-2 border-primary bg-secondary-light ";

  const [selectCompanies, setSelectCompanies] = useState<number[]>([]);

  const handleSelect = (analysisId: number) => {
    setSelectCompanies((prev) => {
      if (prev.includes(analysisId)) {
        return prev.filter((id) => id !== analysisId);
      }
      return [...prev, analysisId];
    });
  };

  const adaptData = (
    data: JobBookMarkResponse[] | CompanyBookMarkResponse[],
    nowStep: number
  ) => {
    if (!data || data.length === 0) {
      return [];
    }

    if (nowStep === 1) {
      return (data as CompanyBookMarkResponse[]).map((item) => ({
        id: item.companyAnalysisId,
        name: item.companyName ?? "",
        industry: item.companyIndustry ?? "",
      }));
    } else if (nowStep === 2) {
      return (data as JobBookMarkResponse[]).map((item) => ({
        id: item.jobRoleAnalysisId,
        name: item.jobRoleName ?? "",
        industry: item.jobRoleCategory ?? "",
      }));
    }
  };

  const reports = adaptData(jobData, nowStep);
  console.log(companyData);

  return (
    <>
      <div className="grid md:grid-cols-3 grid-cols-2 gap-4 ">
        {reports &&
          reports.map((report) => {
            const isSelected = selectCompanies.includes(report.id);
            return (
              <div
                onClick={() => handleSelect(report.id)}
                key={report.id}
                className={`${
                  isSelected && selectedStyle
                } ${reportBlockLayout} ${hoverReportBlockLayout}  group active:bg-active`}
              >
                <div className="group-active:bg-active group-active:border-active duration-100 border mr-3 bg-secondary-light rounded-full size-15 flex justify-center items-center font-bold text-primary text-xl aspect-square">
                  {report.name[0]}
                </div>
                <div>
                  <div className=" font-semibold text-xl">{report.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {report.industry}
                  </div>
                </div>
              </div>
            );
          })}
        <div
          className={`${reportBlockLayout} ${hoverReportBlockLayout} flex-col`}
        >
          <div className="">기업 추가하기</div>
          <div>+</div>
        </div>
      </div>
    </>
  );
}

export default ReportList;
