import { Button } from "@/components/Button";
import Loading from "@/components/Loading/Loading";
import { useGetCompanies } from "@/hooks/companyHooks";
import { useSelectCompanyStore } from "@/store/coverLetterAnalysisStore";
import { CompanyState } from "@/types/coverLetterStoreTypes";
import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { BsClockHistory } from "react-icons/bs"; // 검색 기록 아이콘

// 검색 기록 타입 정의
interface SearchHistoryItem extends CompanyState {
  timestamp: number;
}

interface CompanySearchProps {
  modalClose: () => void;
}

function CompanySearch({ modalClose }: CompanySearchProps) {
  const [inputValue, setInputValue] = useState("");
  const [keyword, setKeyword] = useState("");
  const { setSelectCompany } = useSelectCompanyStore();
  const { data, isLoading } = useGetCompanies(keyword);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // 로컬 스토리지에서 검색 기록 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem("companySearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(inputValue);
      console.log(`${keyword} 검색 실행`);
      // 검색어가 입력되면 검색 결과 표시, 아니면 검색 기록 표시
      if (inputValue.trim()) {
        setShowHistory(false);
      } else {
        setShowHistory(true);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 검색 기록 저장 함수
  const saveToHistory = (companyData: CompanyState) => {
    // 로컬 스토리지에서 최신 기록 가져오기 (다른 곳에서 변경되었을 수 있음)
    const savedHistory = localStorage.getItem("companySearchHistory");
    let currentHistory: SearchHistoryItem[] = [];

    if (savedHistory) {
      currentHistory = JSON.parse(savedHistory);
    }

    // 새 항목 생성
    const newHistoryItem: SearchHistoryItem = {
      ...companyData,
      timestamp: Date.now(),
    };

    // 중복 항목 제거 (같은 companyId가 있으면 제거)
    const filteredHistory = currentHistory.filter(
      (item) => item.companyId !== companyData.companyId
    );

    // 새 항목을 맨 앞에 추가 (최근 검색 순)
    const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 10); // 최대 10개까지만 저장

    // 상태와 로컬 스토리지 업데이트
    setSearchHistory(updatedHistory);
    localStorage.setItem(
      "companySearchHistory",
      JSON.stringify(updatedHistory)
    );

    console.log("검색 기록 저장됨:", newHistoryItem.companyName);
  };

  const handleOnClick = (companyData: CompanyState) => {
    // Zustand 스토어에 선택한 기업 저장
    setSelectCompany(companyData);

    // 검색 기록에 저장
    saveToHistory(companyData);

    // 모달 닫기
    modalClose();
  };

  // 검색 기록에서 선택
  const selectFromHistory = (companyData: CompanyState) => {
    setSelectCompany(companyData);
    saveToHistory(companyData); // 다시 맨 앞으로 이동
    modalClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      modalClose();
    }
  };

  const contents = {
    title: "기업명을 검색해 주세요",
    placeholder: "기업명 입력",
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container w-150 h-auto max-h-100">
        <div className="font-bold text-xl mb-2">{contents.title}</div>
        <div className="flex">
          <input
            type="text"
            placeholder={contents.placeholder}
            className="relative border-2 h-10 pl-3 w-full rounded-l-xl outline-0 focus:border-primary focus:border-2 duration-100"
            onChange={handleOnChange}
            value={inputValue}
          />

          <Button className="w-10 h-10 rounded-l-none rounded-r-xl">
            <AiOutlineSearch className="size-5"></AiOutlineSearch>
          </Button>
        </div>

        {/* 검색 기록 표시 (검색어가 없을 때) */}
        {showHistory && searchHistory.length > 0 && !isLoading && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold flex items-center">
                <BsClockHistory className="mr-1" /> 최근 검색 기록
              </div>
            </div>
            <div className="border border-b-0 rounded overflow-y-auto">
              {searchHistory.map((item) => (
                <div
                  key={`history-${item.companyId}`}
                  onClick={() => selectFromHistory(item)}
                  className="cursor-pointer text-sm border-b-1 grid grid-cols-10 items-center h-14 px-3 hover:border-primary hover:border-1 hover:rounded transition-all duration-150 hover:bg-secondary-light"
                >
                  <span className="col-span-1 border bg-secondary-light rounded-full size-7 flex justify-center items-center font-semibold text-primary text-sm aspect-square">
                    {item.companyName[0]}
                  </span>
                  <span className="col-span-2 font-medium text-left ml-3">
                    {item.companyName}
                  </span>
                  <span className="col-span-5 ">{item.companyLocation}</span>
                  <span className="col-span-2 text-right ">
                    {item.companySize}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 검색 결과 표시 */}
        {isLoading && <Loading radius={3}></Loading>}
        {data && !showHistory && (
          <div className="border border-b-0 rounded overflow-y-auto mt-3">
            {data.map((el) => (
              <div
                onClick={() =>
                  handleOnClick({
                    companyId: el.id,
                    companyLocation: el.companyLocation,
                    companyName: el.companyName,
                    companySize: el.companySize,
                  })
                }
                key={el.id}
                className="cursor-pointer text-sm border-b-1 grid grid-cols-10 items-center h-14 px-3 hover:border-primary hover:border-1 hover:rounded transition-all duration-150 hover:bg-secondary-light group:active:bg-primary"
              >
                <span className="col-span-1 group-active:bg-active group-active:border-active duration-100 border bg-secondary-light rounded-full size-7 flex justify-center items-center font-semibold text-primary text-sm aspect-square">
                  {el.companyName[0]}
                </span>
                <span className="col-span-2 font-medium text-left ml-3">
                  {el.companyName}
                </span>
                <span className="col-span-5 text-right ">
                  {el.companyLocation}
                </span>
                <span className="col-span-2 text-right ">{el.companySize}</span>
              </div>
            ))}
          </div>
        )}

        {/* 검색 결과가 없을 때 */}
        {data && data.length === 0 && !isLoading && !showHistory && (
          <div className="text-center py-4 text-gray-500">
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanySearch;
