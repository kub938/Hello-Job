import { useState } from "react";
import MypageHeader from "./MypageHeader";
import { getMyCompanies } from "@/api/mypageApi";
import DetailModal from "@/components/Common/DetailModal";
import ReadCorporate from "@/pages/CorporateResearch/components/ReadCorporate";
import { useQuery } from "@tanstack/react-query";
import CorporateReportCard from "@/pages/CorporateResearch/components/CorporateReportCard";

function MyCompanies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [researchCompanyId, setResearchCompanyId] = useState<number>(1);
  const [clickedCompanyId, setClickedCompanyId] = useState<number>(1);

  const { data: myCompanyListData, isLoading } = useQuery({
    queryKey: ["myCompanyList"],
    queryFn: async () => {
      const response = await getMyCompanies();
      return response.data;
    },
  });

  const openReadModal = (id: number) => {
    setResearchCompanyId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 md:ml-58 transition-all duration-300">
      <MypageHeader title="내 기업 분석" />
      <h2 className="text-xl font-semibold mb-4">
        내가 작성한 기업 분석을 모아 볼 수 있습니다.
      </h2>
      <div className="flex justify-start gap-4 w-[1164px] mx-auto flex-wrap">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : myCompanyListData && myCompanyListData.length > 0 ? (
          myCompanyListData.map((corporateReport) => (
            <CorporateReportCard
              key={corporateReport.companyAnalysisId}
              onClick={() => {
                setClickedCompanyId(corporateReport.companyAnalysisId);
                openReadModal(corporateReport.companyAnalysisId);
              }}
              companyAnalysisTitle={corporateReport.companyAnalysisTitle}
              createdAt={corporateReport.createdAt}
              companyViewCount={corporateReport.companyViewCount}
              companyLocation={corporateReport.companyLocation}
              companyAnalysisBookmarkCount={
                corporateReport.companyAnalysisBookmarkCount
              }
              bookmark={corporateReport.bookmark}
              dartCategory={corporateReport.dartCategory}
              isPublic={corporateReport.public}
              reportId={corporateReport.companyAnalysisId}
              isFinding={false}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg h-[110px] w-full flex flex-col items-center justify-center">
            <h1>작성한 기업 분석이 없습니다.</h1>
            <h1 className="text-base mt-2">기업 분석을 작성해보세요.</h1>
          </div>
        )}
      </div>
      {isModalOpen && (
        <DetailModal isOpen={isModalOpen} onClose={closeModal}>
          <ReadCorporate
            onClose={closeModal}
            id={researchCompanyId}
            companyId={String(clickedCompanyId)}
          />
        </DetailModal>
      )}
    </div>
  );
}

export default MyCompanies;
