import { useState } from "react";
import MypageHeader from "./MypageHeader";
import { useQuery } from "@tanstack/react-query";
import { getCompanyBookMarksAll } from "@/api/mypageApi";
import DetailModal from "@/components/Common/DetailModal";
import ReadCorporate from "@/pages/CorporateResearch/components/ReadCorporate";
import CorporateReportCard from "@/pages/CorporateResearch/components/CorporateReportCard";

function BookmarkedCompanies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [researchCompanyId, setResearchCompanyId] = useState<number>(1);
  const [clickedCompanyId, setClickedCompanyId] = useState<number>(1);

  const { data: bookmarkedCompanyListData, isLoading } = useQuery({
    queryKey: ["bookmarkedCompanyList"],
    queryFn: async () => {
      const response = await getCompanyBookMarksAll();
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
    <div className="flex-1 p-4 md:p-6 md:ml-56 transition-all duration-300">
      <MypageHeader title="기업 분석 북마크" />
      <h2 className="text-xl font-semibold mb-4">
        내가 북마크한 기업 분석을 모아 볼 수 있습니다.
      </h2>
      <div className="flex justify-start gap-4 w-[1164px] mx-auto flex-wrap">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : bookmarkedCompanyListData &&
          bookmarkedCompanyListData.length > 0 ? (
          bookmarkedCompanyListData.map((corporateReport) => (
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
            <h1>기업 분석이 없습니다.</h1>
            <h1 className="text-base mt-2">기업 분석을 북마크 해보세요.</h1>
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

export default BookmarkedCompanies;
