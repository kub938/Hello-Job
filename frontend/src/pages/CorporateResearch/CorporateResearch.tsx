import { Button } from "@/components/Button";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { corporateReportApi } from "@/api/corporateReport";

import { FaPlus } from "react-icons/fa6";
import DetailModal from "@/components/Common/DetailModal";
import CreateCorporate from "./components/CreateCorporate";
import ReadCorporate from "./components/ReadCorporate";

import CorporateReportCard from "./components/CorporateReportCard";
import { getCompanyDetail } from "@/api/companyApi";

interface CorporateReport {
  companyAnalysisId: number;
  companyAnalysisTitle: string;
  companyName: string;
  createdAt: string;
  companyViewCount: number;
  companyAnalysisBookmarkCount: number;
  companyLocation: string;
  bookmark: boolean;
  dartCategory: string[];
  public: boolean;
}

export interface CorporateResearchProps {
  type?: "modal";
  companyId?: number;
  modalClose?: () => void;
}

function CorporateResearch({
  modalClose,
  type,
  companyId,
}: CorporateResearchProps) {
  const params = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"create" | "read">("create");
  const [researchId, setResearchId] = useState<number>(1);
  const id = params.id ? params.id : String(companyId);
  const [searchParams] = useSearchParams();
  const openId = searchParams.get("openId");

  console.log(params.id ? "true" : "false");
  // tanstack query를 사용한 특정 기업의 모든 리포트 불러오기
  const { data: corporateReportListData, isLoading } = useQuery({
    queryKey: ["corporateReportList", id],
    queryFn: async () => {
      const response = await corporateReportApi.getCorporateReportList(
        parseInt(id)
      );
      return response.data;
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

  const [corporateReportList, setCorporateReportList] = useState<
    CorporateReport[]
  >([]);

  useEffect(() => {
    const temp =
      corporateReportListData?.map((corporateReport) => ({
        companyAnalysisId: corporateReport.companyAnalysisId,
        companyAnalysisTitle: corporateReport.companyAnalysisTitle,
        companyName: corporateReport.companyName,
        createdAt: corporateReport.createdAt,
        companyViewCount: corporateReport.companyViewCount,
        companyLocation: corporateReport.companyLocation,
        companyAnalysisBookmarkCount:
          corporateReport.companyAnalysisBookmarkCount,
        bookmark: corporateReport.bookmark,
        dartCategory: corporateReport.dartCategory,
        public: corporateReport.public,
      })) || [];
    setCorporateReportList(temp);
  }, [corporateReportListData]);

  useEffect(() => {
    if (openId) {
      const parsedId = parseInt(openId);
      if (!isNaN(parsedId)) {
        openReadModal(parsedId);
        // URL에서 openId를 제거
        searchParams.delete("openId");
        navigate(`${location.pathname}`, { replace: true });
      }
    }
  }, [openId]);

  const openCreateModal = () => {
    setModalView("create");
    setIsModalOpen(true);
  };

  const openReadModal = (id: number) => {
    setResearchId(id);
    setModalView("read");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="justify-between w-full h-full p-6">
      <h2 className="text-2xl font-bold mb-4">
        {type === "modal"
          ? "사용하실 기업분석 레포트를 북마크해 주세요!"
          : "기업 분석 검색 결과"}
      </h2>
      {isDetailLoading ? (
        <h1 className="text-3xl font-bold mb-1">불러오는 중...</h1>
      ) : (
        <h1 className="text-3xl font-bold mb-1">
          {companyDetail?.companyName}
        </h1>
      )}

      <h1 className="text-3xl font-bold mb-12">기업 분석 레포트 목록입니다</h1>
      <div className="flex justify-start gap-4 w-[1164px] mx-auto flex-wrap">
        <button className="cursor-pointer" onClick={openCreateModal}>
          <div className="w-[220px] h-[180px] rounded-lg group border border-dashed border-[#886BFB] flex flex-col items-center justify-center gap-2 hover:border-[#6F52E0] transition-colors">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#AF9BFF] group-hover:bg-[#886BFB] transition-colors text-white">
              <FaPlus />
            </div>
            <span className="text-[#6E7180] group-hover:text-black transition-colors">
              기업 분석 추가하기
            </span>
          </div>
        </button>
        {isLoading ? (
          <div>로딩 중...</div>
        ) : corporateReportList.length > 0 ? (
          corporateReportList.map((corporateReport) => (
            <CorporateReportCard
              key={corporateReport.companyAnalysisId}
              onClick={() => {
                openReadModal(corporateReport.companyAnalysisId);
              }}
              modalClose={modalClose}
              reportId={corporateReport.companyAnalysisId}
              companyId={id}
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
              isFinding={type === "modal" ? true : false} //companyId가 있으면 자소서 작성 중임임
            />
          ))
        ) : (
          <div className="text-center text-gray-500 text-lg h-[180px] w-[210px] flex flex-col items-center justify-center">
            <h1>검색 결과가 없습니다.</h1>
            <h1 className="text-base mt-2">기업 분석을 진행해주세요.</h1>
          </div>
        )}
      </div>

      {type !== "modal" && (
        <footer className="fixed left-0 bottom-0 w-full flex justify-center gap-4 pb-6 pt-10 bg-gradient-to-t from-[#FFFFFF]/70 via-[#FFFFFF]/70 to-transparent">
          <Button
            onClick={() => navigate(-1)}
            variant={"white"}
            className="text-base"
          >
            이전
          </Button>
          <Button
            onClick={() => navigate(`/job-research/${params.id}`)}
            variant={"default"}
            className="text-base"
          >
            직무 분석으로
          </Button>
        </footer>
      )}

      {isModalOpen && (
        <DetailModal isOpen={isModalOpen} onClose={closeModal}>
          {modalView === "create" ? (
            <CreateCorporate
              onClose={closeModal}
              corporateId={parseInt(id ? id : "1")}
            />
          ) : (
            <ReadCorporate
              onClose={closeModal}
              id={researchId}
              companyId={id}
            />
          )}
        </DetailModal>
      )}
    </div>
  );
}

export default CorporateResearch;
