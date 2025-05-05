import { Button } from "@/components/Button";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { corporateReportApi } from "@/api/corporateReport";
import CorporateDetailModal from "./components/CorporateDetailModal";

import { FaClock, FaBuildingUser, FaPlus } from "react-icons/fa6";

// 더미 데이터 배열 정의
interface AnalysisReport {
  title: string;
  companyAnlaysisId: string;
  createdAt: string;
  companyViewCount: number;
  companyLocation: string;
  companyIndustry: string;
  companyAnalysisBookmarkCount: number;
  bookmark: boolean;
  public: boolean;
}

// 더미 데이터
const dummyReports: AnalysisReport[] = [
  {
    title: "재무재표 중심 기업 분석",
    companyAnlaysisId: "1",
    createdAt: "2023-11-15",
    companyViewCount: 1250,
    companyLocation: "서울특별시 서초구",
    companyIndustry: "전자/반도체",
    companyAnalysisBookmarkCount: 87,
    bookmark: true,
    public: true,
  },
  {
    title: "사업 계획서 기반으로 작성함",
    companyAnlaysisId: "2",
    createdAt: "2023-10-22",
    companyViewCount: 980,
    companyLocation: "서울특별시 서초구",
    companyIndustry: "전자/반도체",
    companyAnalysisBookmarkCount: 65,
    bookmark: false,
    public: true,
  },
  {
    title: "뉴스 크롤링 데이터 많음",
    companyAnlaysisId: "3",
    createdAt: "2023-09-05",
    companyViewCount: 1540,
    companyLocation: "경기도 수원시",
    companyIndustry: "전자/반도체",
    companyAnalysisBookmarkCount: 120,
    bookmark: false,
    public: true,
  },
];

function CorporateResearch() {
  const params = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // tanstack query를 사용한 데이터 불러오기

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col justify-between w-full h-full p-6">
      <h2 className="text-2xl font-bold mb-4">기업 분석 검색 결과</h2>
      <h1 className="text-3xl font-bold mb-1">삼성 전자</h1>
      <h1 className="text-3xl font-bold mb-12">기업 분석 레포트 목록입니다</h1>
      <div className="flex justify-start gap-4 w-[1064px] mx-auto flex-wrap">
        <button className="cursor-pointer" onClick={openModal}>
          <div className="w-[200px] h-[180px] rounded-lg group border border-dashed border-[#886BFB] flex flex-col items-center justify-center gap-2 hover:border-[#6F52E0] transition-colors">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#AF9BFF] group-hover:bg-[#886BFB] transition-colors text-white">
              <FaPlus />
            </div>
            <span className="text-[#6E7180] group-hover:text-black transition-colors">
              기업 분석 추가하기
            </span>
          </div>
        </button>
        <div className="w-[200px] h-[180px] bg-gray-200 rounded-lg"></div>
        <div className="w-[200px] h-[180px] bg-gray-200 rounded-lg"></div>
        <div className="w-[200px] h-[180px] bg-gray-200 rounded-lg"></div>
        <div className="w-[200px] h-[180px] bg-gray-200 rounded-lg"></div>
        <div className="w-[200px] h-[180px] bg-gray-200 rounded-lg"></div>
      </div>

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

      {isModalOpen && <CorporateDetailModal />}
    </div>
  );
}

export default CorporateResearch;
