import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useSelectCompanyStore } from "@/store/coverLetterAnalysisStore";
import JobSearch from "./Modal/SearchInputModal/JobSearch";
import CompanySearch from "./Modal/SearchInputModal/CompanySearch";
import { BsClockHistory } from "react-icons/bs"; // 검색 기록 아이콘
import { CompanyState } from "@/types/coverLetterStoreTypes";
import { formatDate } from "@/utils/formatDate";

export type SearchType = "job" | "company" | "";

// 검색 기록 타입 정의
interface SearchHistoryItem extends CompanyState {
  timestamp: number;
}

function JobCompanyForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { company, setSelectCompany } = useSelectCompanyStore();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // 컴포넌트 마운트 시 로컬 스토리지에서 검색 기록 가져오기
  useEffect(() => {
    const savedHistory = localStorage.getItem("companySearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const modalClose = () => {
    // 모달이 닫힐 때 검색 기록 다시 로드 (새로운 기록이 추가되었을 수 있음)
    const savedHistory = localStorage.getItem("companySearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    setIsModalOpen(false);
  };

  const modalOpen = () => {
    setIsModalOpen(true);
  };

  const handleCompanyClick = () => {
    modalOpen();
  };

  // 검색 기록에서 기업 선택
  const selectCompanyFromHistory = (companyData: CompanyState) => {
    setSelectCompany(companyData);

    // 선택한 기업을 검색 기록의 맨 앞으로 이동
    const existingItem = searchHistory.find(
      (item) => item.companyId === companyData.companyId
    );

    if (existingItem) {
      // timestamp 업데이트
      const updatedItem = { ...existingItem, timestamp: Date.now() };
      const filteredHistory = searchHistory.filter(
        (item) => item.companyId !== companyData.companyId
      );
      const updatedHistory = [updatedItem, ...filteredHistory];

      setSearchHistory(updatedHistory);
      localStorage.setItem(
        "companySearchHistory",
        JSON.stringify(updatedHistory)
      );
    }
  };

  // 최근 검색 기록 표시 (최대 3개)
  const recentSearches = searchHistory.slice(0, 3);

  return (
    <>
      {isModalOpen && <CompanySearch modalClose={modalClose}></CompanySearch>}
      <div className="flex w-full h-auto justify-center gap-5">
        <div className="border rounded-xl w-full p-5">
          <div className="font-semibold text-xl">기업 선택</div>

          {/* 선택된 기업 표시 */}
          {company.companyId !== -1 && (
            <div
              onClick={handleCompanyClick}
              className="mt-2 cursor-pointer text-sm border rounded-xl grid grid-cols-10 items-center h-11 px-3 hover:border-primary hover:border-2 transition-all duration-150 hover:bg-secondary-light group:active:bg-primary"
            >
              <span className="col-span-1 group-active:bg-active group-active:border-active duration-100 border bg-secondary-light rounded-full size-7 flex justify-center items-center font-semibold text-primary text-sm aspect-square">
                {company.companyName[0]}
              </span>
              <span className="col-span-3 font-medium text-left ml-3 truncate">
                {company.companyName}
              </span>
              <span className="col-span-4 text-right truncate">
                {company.companyLocation}
              </span>
              <span className="col-span-2 text-right">
                {company.companySize}
              </span>
            </div>
          )}

          {/* 기업 검색 버튼 - 항상 표시 */}
          {company.companyId === -1 ? (
            <div
              onClick={handleCompanyClick}
              className="bg-background font-semibold text-text-muted-foreground flex justify-center items-center gap-2 border rounded h-10 mt-3 w-full"
            >
              <div>기업명을 검색하세요</div>
              <AiOutlineSearch />
            </div>
          ) : (
            <div
              onClick={handleCompanyClick}
              className="bg-background font-semibold text-text-muted-foreground flex justify-center items-center gap-2 border rounded h-10 mt-3 w-full"
            >
              <div>다른 기업 검색하기</div>
              <AiOutlineSearch />
            </div>
          )}

          {/* 최근 검색 기록 표시 영역 - 항상 표시 */}
          {recentSearches.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center mb-2 text-sm font-semibold text-text-muted-foreground">
                <BsClockHistory className="mr-1" /> 최근 검색 기업
              </div>
              <div className="space-y-2">
                {recentSearches.map((item) => (
                  <div
                    key={`recent-${item.companyId}`}
                    onClick={() => selectCompanyFromHistory(item)}
                    className={`cursor-pointer text-sm border rounded-lg grid grid-cols-10 items-center h-11 px-3 hover:border-primary hover:border-1 hover:bg-secondary-light transition-all duration-150 ${
                      company.companyId === item.companyId
                        ? "border-primary border-2 bg-secondary-light"
                        : ""
                    }`}
                  >
                    <span className="col-span-1 border bg-secondary-light rounded-full size-7 flex justify-center items-center font-semibold text-primary text-sm aspect-square">
                      {item.companyName[0]}
                    </span>
                    <span className="col-span-4 font-medium text-left ml-3 truncate">
                      {item.companyName}
                    </span>
                    <span className="col-span-3 text-right truncate text-text-muted-foreground">
                      {item.companyLocation}
                    </span>
                    <span className="col-span-2 text-right text-xs text-gray-400">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 검색 기록이 없을 때 */}
          {recentSearches.length === 0 && (
            <div className="mt-4 text-sm text-center text-text-muted-foreground py-3 border rounded-lg">
              최근 검색한 기업이 없습니다
            </div>
          )}
        </div>
        <JobSearch></JobSearch>
      </div>
    </>
  );
}
export default JobCompanyForm;
