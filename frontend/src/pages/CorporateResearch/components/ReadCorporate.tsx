import { corporateReportApi } from "@/api/corporateReport";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { Button } from "@/components/Button";
import { parseData, Section } from "@/hooks/researchParseHook";
import AnalysisSummary from "./AnalysisSummary";
import PublicInformation from "./PublicInformation";
import NewsInformation from "./NewsInformation";

interface ReadCorporateProps {
  id: number;
  onClose: () => void;
  companyId: string;
}

// 탭 타입 정의
type TabType = "분석 요약" | "공시 정보" | "뉴스 정보";

function ReadCorporate({ onClose, id, companyId }: ReadCorporateProps) {
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isValidId, setIsValidId] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("분석 요약");
  const [dartCompanyAnalysis, setDartCompanyAnalysis] = useState<Section[]>([]);
  const [dartFinancialSummery, setDartFinancialSummery] = useState<Section[]>(
    []
  );

  // id 유효성 검사
  useEffect(() => {
    if (Number.isInteger(id) && id > 0) {
      setIsValidId(true);
    } else {
      setIsValidId(false);
    }
  }, [id]);

  // 기업 분석 레포트 상세 정보 불러오기
  const { data: reportDetail, isLoading } = useQuery({
    queryKey: ["corporateReportDetail", id],
    queryFn: async () => {
      const response = await corporateReportApi.getCorporateReportDetail(id);
      console.log(response.data);
      setDartCompanyAnalysis(parseData(response.data.dartCompanyAnalysis));
      setDartFinancialSummery(parseData(response.data.dartFinancialSummery));
      return response.data;
    },
    enabled: isValidId,
  });

  // reportDetail이 변경될 때 북마크 상태 업데이트
  useEffect(() => {
    if (reportDetail) {
      setIsBookmarked(reportDetail.bookmark);
    }
  }, [reportDetail]);

  // 북마크 추가 mutation
  const addBookmarkMutation = useMutation({
    mutationFn: () =>
      corporateReportApi.postBookmark({ companyAnalysisId: id }),
    onSuccess: () => {
      console.log("북마크 추가 성공");
      setIsBookmarked(true);
      queryClient.invalidateQueries({
        queryKey: ["corporateReportDetail", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["corporateReportList", companyId],
      });
    },
  });

  // 북마크 삭제 mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: () => corporateReportApi.deleteBookmark(id),
    onSuccess: () => {
      console.log("북마크 삭제 성공");
      setIsBookmarked(false);
      queryClient.invalidateQueries({
        queryKey: ["corporateReportDetail", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["corporateReportList", companyId],
      });
    },
  });

  // 북마크 토글 핸들러
  const toggleBookmark = () => {
    if (isBookmarked) {
      removeBookmarkMutation.mutate();
    } else {
      addBookmarkMutation.mutate();
    }
  };

  return (
    <>
      <div className="h-[90vh] w-[940px] bg-white rounded-t-xl py-8 px-12 overflow-y-auto">
        <header className="flex w-full justify-between items-end mb-4">
          <h1 className="text-2xl font-bold">
            {isLoading || !reportDetail
              ? "로딩 중..."
              : reportDetail.companyName}{" "}
            기업 분석 -{" "}
            {isLoading || !reportDetail
              ? ""
              : new Date(reportDetail.createdAt).toLocaleDateString("ko-KR")}
          </h1>
          <button
            onClick={toggleBookmark}
            className="flex cursor-pointer items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
          >
            {isBookmarked ? (
              <FaBookmark className="text-[#6F52E0]" />
            ) : (
              <FaRegBookmark />
            )}
            <span>북마크</span>
          </button>
        </header>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex">
            {(["분석 요약", "공시 정보", "뉴스 정보"] as TabType[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 text-center font-medium text-gray-700 hover:text-[#6F52E0] transition-colors ${
                    activeTab === tab
                      ? "text-[#6F52E0] border-b-2 border-[#6F52E0]"
                      : ""
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* 탭 내용 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <p>로딩 중...</p>
          </div>
        ) : (
          <>
            {activeTab === "분석 요약" && (
              <AnalysisSummary reportDetail={reportDetail} />
            )}
            {activeTab === "공시 정보" && (
              <PublicInformation
                reportDetail={reportDetail}
                dartCompanyAnalysis={dartCompanyAnalysis}
                dartFinancialSummery={dartFinancialSummery}
              />
            )}
            {activeTab === "뉴스 정보" && (
              <NewsInformation reportDetail={reportDetail} />
            )}
          </>
        )}
      </div>
      <div className="h-[80vh] mb-[10vh] w-[280px] flex flex-col justify-between bg-white rounded-xl border-t-6 border-[#AF9BFF] p-6">
        <header>
          <h1 className="text-xl font-bold">분석 결과 필터</h1>
        </header>
        <main>
          <h3>
            분석 결과를 더 쉽게 볼 수 있도록 도움을 주는 UI를 개발할 예정이에요.
          </h3>
          <br />
          <h3>다음 배포를 기대해주세요!</h3>
        </main>
        <footer className="flex gap-2 w-full justify-center">
          <Button className="px-6" variant={"white"}>
            이전
          </Button>
          <Button className="px-6" variant={"default"} onClick={onClose}>
            확인
          </Button>
        </footer>
      </div>
    </>
  );
}

export default ReadCorporate;
