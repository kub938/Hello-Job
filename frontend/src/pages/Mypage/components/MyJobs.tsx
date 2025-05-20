import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getMyJobs } from "@/api/mypageApi";
import MypageHeader from "./MypageHeader";
import DetailModal from "@/components/Common/DetailModal";
import JobResearchCard from "@/pages/JobResearch/components/JobResearchCard";
import ReadJob from "@/pages/JobResearch/components/ReadJob";

function MyJobs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [researchJobId, setResearchJobId] = useState<number>(1);
  const [clickedCompanyId, setClickedCompanyId] = useState<number>(1);

  const { data: myJobListData, isLoading } = useQuery({
    queryKey: ["myJobList"],
    queryFn: async () => {
      const response = await getMyJobs();
      return response.data;
    },
  });

  const openReadModal = (id: number) => {
    setResearchJobId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 md:p-6 md:ml-58 transition-all duration-300">
      <MypageHeader title="내 직무 분석" />
      <h2 className="text-xl font-semibold mb-4">
        내가 작성한 직무 분석을 모아 볼 수 있습니다.
      </h2>

      <div className="flex flex-col gap-4 w-full items-center p-4">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : myJobListData && myJobListData.length > 0 ? (
          myJobListData.map((jobResearch) => (
            <JobResearchCard
              key={jobResearch.jobRoleAnalysisId}
              onClick={() => {
                setClickedCompanyId(jobResearch.jobRoleAnalysisId);
                openReadModal(jobResearch.jobRoleAnalysisId);
              }}
              jobId={jobResearch.jobRoleAnalysisId}
              jobRoleName={jobResearch.jobRoleName}
              jobRoleAnalysisTitle={jobResearch.jobRoleAnalysisTitle}
              jobRoleCategory={jobResearch.jobRoleCategory}
              jobRoleViewCount={jobResearch.jobRoleViewCount}
              jobRoleBookmarkCount={jobResearch.jobRoleBookmarkCount}
              bookmark={jobResearch.bookmark}
              createdAt={jobResearch.updatedAt}
              isPublic={jobResearch.public}
              isFinding={false}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg h-[110px] w-full flex flex-col items-center justify-center">
            <h1>작성한 직무 분석이 없습니다.</h1>
            <h1 className="text-base mt-2">직무 분석을 작성해보세요.</h1>
          </div>
        )}
      </div>
      {isModalOpen && (
        <DetailModal isOpen={isModalOpen} onClose={closeModal}>
          <ReadJob
            onClose={closeModal}
            id={researchJobId}
            companyId={String(clickedCompanyId)}
          />
        </DetailModal>
      )}
    </div>
  );
}

export default MyJobs;
