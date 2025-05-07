import { Button } from "@/components/Button";
import { useNavigate } from "react-router";
import { useState } from "react";
// import { useNavigate, useParams } from "react-router";
import { FaPlus } from "react-icons/fa6";
import DetailModal from "@/components/Common/DetailModal";
import CreateJob from "./components/CreateJob";
import ReadJob from "./components/ReadJob";

function JobResearch() {
  // const params = useParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"create" | "read">("create");
  // tanstack query를 사용한 데이터 불러오기

  const openCreateModal = () => {
    setModalView("create");
    setIsModalOpen(true);
  };

  const openReadModal = () => {
    setModalView("read");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col justify-between w-full h-full p-6">
      <h2 className="text-2xl font-bold mb-4">직무 분석 검색 결과</h2>
      <h1 className="text-3xl font-bold mb-1">삼성 전자</h1>
      <h1 className="text-3xl font-bold mb-12">직무 분석 레포트 목록입니다</h1>
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
        <div
          onClick={openReadModal}
          className="w-[800px] h-[110px] bg-gray-200 rounded-lg cursor-pointer"
        ></div>
        <div className="w-[800px] h-[110px] bg-gray-200 rounded-lg"></div>
        <div className="w-[800px] h-[110px] bg-gray-200 rounded-lg"></div>
        <div className="w-[800px] h-[110px] bg-gray-200 rounded-lg"></div>
        <div className="w-[800px] h-[110px] bg-gray-200 rounded-lg"></div>
      </div>
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
      {isModalOpen && (
        <DetailModal isOpen={isModalOpen} onClose={closeModal}>
          {modalView === "create" ? <CreateJob /> : <ReadJob />}
        </DetailModal>
      )}
    </div>
  );
}

export default JobResearch;
