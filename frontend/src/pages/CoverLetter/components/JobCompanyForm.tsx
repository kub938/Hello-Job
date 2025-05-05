import { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import SearchInputModal from "./SearchInputModal";

export type SearchType = "job" | "company" | "";

function JobCompanyForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("");

  const modalClose = () => {
    setIsModalOpen(false);
  };

  const modalOpen = () => {
    setIsModalOpen(true);
  };

  const handleCompanyClick = () => {
    setSearchType("company");
    modalOpen();
  };

  const handleJobClick = () => {
    setSearchType("job");
    modalOpen();
  };

  return (
    <>
      {isModalOpen && (
        <SearchInputModal
          type={searchType}
          modalClose={modalClose}
        ></SearchInputModal>
      )}
      <div className="flex w-full justify-center items-center gap-5 ">
        <div className="border rounded-xl w-full p-3">
          <div className="font-semibold text-xl">기업 선택</div>
          <div
            onClick={handleCompanyClick}
            className="bg-background font-semibold text-text-muted-foreground flex justify-center items-center gap-2 border rounded h-10 mt-3 w-full"
          >
            <div>기업명을 검색하세요</div>
            <AiOutlineSearch />
          </div>
          <div className="mt-3 *:font-semibold text-text-muted-foreground">
            최근 검색 기업
          </div>
        </div>
        <div className="border rounded-xl w-full p-3">
          <div className="font-semibold text-xl">직무 선택</div>
          <div
            onClick={handleJobClick}
            className="bg-background font-semibold text-text-muted-foreground flex justify-center items-center gap-2 border rounded h-10 mt-3 w-full"
          >
            <div>직무명을 검색하세요</div>
            <AiOutlineSearch />
          </div>
          <div className="mt-3 *:font-semibold text-text-muted-foreground">
            최근 검색 기업
          </div>
        </div>
      </div>
    </>
  );
}
export default JobCompanyForm;

// enum("서버/백엔드 개발자", "프론트엔드 개발자", "웹 풀스택 개발자", "안드로이드 개발자", "iOS 개발자", "크로스플랫폼 앱개발자", "게임 클라이언트 개발자", "게임 서버 개발자", "DBA", "빅데이터 엔지니어", "인공지능/머신러닝", "devops/시스템 엔지니어", "정보보안 담당자", "QA 엔지니어", "개발 PM", "HW/임베디드", "SW/솔루션", "웹퍼블리셔", "VR/AR/3D", "블록체인", "기술지원", "기타")
