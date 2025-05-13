import { Button } from "@/components/Button";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router";
import { FaPlus } from "react-icons/fa6";
import DetailModal from "@/components/Common/DetailModal";
import CreateJob from "./components/CreateJob";
import ReadJob from "./components/ReadJob";
import { useQuery } from "@tanstack/react-query";
import { jobRoleAnalysis } from "@/api/jobRoleAnalysisApi";
import { getAllJobList } from "@/types/jobResearch";
import JobResearchCard from "./components/JobResearchCard";
import { getCompanyDetail } from "@/api/companyApi";
import { useSelectJobStore } from "@/store/coverLetterAnalysisStore";

export interface JobResearchProps {
  type?: "modal";
  companyId?: number;
}

function JobResearch({ type, companyId }: JobResearchProps) {
  const params = useParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"create" | "read">("create");
  const [researchJobId, setResearchJobId] = useState<number>(1);
  const { jobRoleCategory } = useSelectJobStore();
  const id = params.id ? params.id : String(companyId);

  // tanstack query를 사용한 데이터 불러오기
  const { data: jobResearchListData, isLoading } = useQuery({
    queryKey: ["jobResearchList", id],
    queryFn: async () => {
      if (type === "modal" && jobRoleCategory.trim() !== "") {
        console.log(jobRoleCategory);
        const response = await jobRoleAnalysis.getAllJobList(
          parseInt(id),
          jobRoleCategory.replace(/\s+/g, "")
        );
        return response.data;
      } else {
        const response = await jobRoleAnalysis.getAllJobList(parseInt(id));
        return response.data;
      }
    },
  });

  // 특정 기업 상세 정보 불러오기
  const { data: companyDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ["companyDetail", params.id],
    queryFn: async () => {
      let id;
      if (params.id) {
        id = parseInt(params.id);
      } else if (companyId) {
        id = companyId;
      } else {
        id = 1;
      }
      const response = await getCompanyDetail(id);
      return response.data;
    },
  });

  const [jobResearchList, setJobResearchList] = useState<getAllJobList[]>([]);

  useEffect(() => {
    const temp =
      jobResearchListData?.map((jobRoleAnalysis) => ({
        jobRoleAnalysisId: jobRoleAnalysis.jobRoleAnalysisId,
        jobRoleName: jobRoleAnalysis.jobRoleName,
        jobRoleAnalysisTitle: jobRoleAnalysis.jobRoleAnalysisTitle,
        jobRoleCategory: jobRoleAnalysis.jobRoleCategory,
        jobRoleViewCount: jobRoleAnalysis.jobRoleViewCount,
        jobRoleBookmarkCount: jobRoleAnalysis.jobRoleBookmarkCount,
        bookmark: jobRoleAnalysis.bookmark,
        createdAt: jobRoleAnalysis.createdAt,
        updatedAt: jobRoleAnalysis.updatedAt,
        public: jobRoleAnalysis.public,
      })) || [];
    setJobResearchList(temp);
  }, [jobResearchListData]);

  const openCreateModal = () => {
    setModalView("create");
    setIsModalOpen(true);
  };

  const openReadModal = (id: number) => {
    setResearchJobId(id);
    setModalView("read");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className=" w-full h-full p-6">
      <h2 className="text-2xl font-bold mb-4">직무 분석 검색 결과</h2>
      {isDetailLoading ? (
        <h1 className="text-3xl font-bold mb-1">불러오는 중...</h1>
      ) : (
        <h1 className="text-3xl font-bold mb-1">
          {companyDetail?.companyName}
          {type === "modal" && jobRoleCategory.trim() !== "" && (
            <span className="text-lg"> {jobRoleCategory}</span>
          )}
        </h1>
      )}
      <h1 className="text-3xl font-bold mb-12">직무 분석 레포트 목록입니다</h1>
      {type === "modal" && <h2>직무 분석을 북마크 해주세요!</h2>}
      <div className="flex justify-start gap-2 w-[800px] mx-auto flex-wrap">
        <button className="cursor-pointer" onClick={openCreateModal}>
          <div className="w-[800px] h-[110px] rounded-lg group border border-dashed border-[#886BFB] flex flex-col items-center justify-center gap-2 hover:border-[#6F52E0] transition-colors">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#AF9BFF] group-hover:bg-[#886BFB] transition-colors text-white">
              <FaPlus />
            </div>
            <span className="text-[#6E7180] group-hover:text-black transition-colors">
              직무 분석 추가하기
            </span>
          </div>
        </button>
        {isLoading ? (
          <div>로딩 중...</div>
        ) : jobResearchList.length > 0 ? (
          jobResearchList.map((jobResearch) => (
            <JobResearchCard
              key={jobResearch.jobRoleAnalysisId}
              onClick={() => {
                openReadModal(jobResearch.jobRoleAnalysisId);
              }}
              jobRoleName={jobResearch.jobRoleName}
              jobRoleAnalysisTitle={jobResearch.jobRoleAnalysisTitle}
              jobRoleCategory={jobResearch.jobRoleCategory}
              jobRoleViewCount={jobResearch.jobRoleViewCount}
              jobRoleBookmarkCount={jobResearch.jobRoleBookmarkCount}
              bookmark={jobResearch.bookmark}
              createdAt={jobResearch.createdAt}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg h-[110px] w-[800px] flex flex-col items-center justify-center">
            <h1>검색 결과가 없습니다.</h1>
            <h1 className="text-base mt-2">직무 분석을 진행해주세요.</h1>
          </div>
        )}
      </div>
      {type !== "modal" && (
        <footer className="fixed left-0 bottom-0 w-full flex justify-center gap-4 pb-6 pt-10 bg-gradient-to-t from-[#FFFFFF]/70 via-[#FFFFFF]/70 to-transparent ">
          <Button
            onClick={() => navigate(-1)}
            variant={"white"}
            className="text-base"
          >
            이전
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant={"default"}
            className="text-base"
          >
            홈으로
          </Button>
        </footer>
      )}

      {isModalOpen && (
        <DetailModal isOpen={isModalOpen} onClose={closeModal}>
          {modalView === "create" ? (
            <CreateJob
              onClose={closeModal}
              corporateId={parseInt(params.id ? params.id : "1")}
            />
          ) : (
            <ReadJob onClose={closeModal} id={researchJobId} companyId={id} />
          )}
        </DetailModal>
      )}
    </div>
  );
}

export default JobResearch;
