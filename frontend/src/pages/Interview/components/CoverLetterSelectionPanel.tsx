import { useRef, useEffect } from "react";
import { FileText, ChevronRight, RefreshCw } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCoverLetterList } from "@/api/mypageApi";

interface CoverLetter {
  coverLetterId: number;
  coverLetterTitle: string;
  companyName: string;
  jobRoleName: string;
  updatedAt: string;
}

interface CoverLetterSelectionPanelProps {
  selectedCoverLetterId: number | null;
  onSelectCoverLetter: (id: number) => void;
}

function CoverLetterSelectionPanel({
  selectedCoverLetterId,
  onSelectCoverLetter,
}: CoverLetterSelectionPanelProps) {
  // 무한 스크롤
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["coverLetterList"],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const response = await getCoverLetterList(Number(pageParam));
          console.log("Response status:", response.status);

          // 204 No Content 응답 처리
          if (response.status === 204) {
            // 빈 데이터 구조 반환
            return {
              content: [],
              pageable: { pageNumber: pageParam },
              last: true,
            };
          }

          return response.data;
        } catch (error) {
          console.error("Error fetching cover letters:", error);
          throw error;
        }
      },

      getNextPageParam: (lastPage) => {
        // 페이지가 없거나 마지막 페이지인 경우
        if (!lastPage || lastPage.last) return undefined;

        console.log("Current page:", lastPage.pageable?.pageNumber);
        return lastPage.pageable?.pageNumber + 1;
      },
      initialPageParam: 0,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "0px 0px 200px 0px", threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 모든 자기소개서 목록을 평탄화
  const coverLetters = data?.pages.flatMap((page) => page.content || []) || [];

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // 데이터가 비어있는지 확인 (204 상태 코드의 경우)
  const isEmptyData = status === "success" && coverLetters.length === 0;

  return (
    <div className="bg-white h-[55vh] overflow-auto   rounded-xl shadow-sm border border-border p-5">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FileText className="w-5 h-5 text-primary mr-2" />내 자기소개서
      </h2>

      <div className="space-y-3  pr-2">
        {status === "pending" ? (
          <div className="py-4 flex justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : status === "error" ? (
          <div className="text-center py-8 text-red-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        ) : isEmptyData ? (
          <>
            <div className="text-center pt-8 text-muted-foreground">
              자기소개서가 없습니다
            </div>
            <div className="text-center pb-8 text-muted-foreground">
              자기소개서 작성을 먼저 진행해 주세요!
            </div>
          </>
        ) : (
          <>
            {coverLetters.map((coverLetter: CoverLetter) => (
              <button
                key={`${coverLetter.coverLetterId}`}
                onClick={() => onSelectCoverLetter(coverLetter.coverLetterId)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedCoverLetterId === coverLetter.coverLetterId
                    ? "border-primary bg-secondary-light"
                    : "border-border hover:border-primary/30 hover:bg-secondary-light/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-secondary-foreground">
                      {coverLetter.coverLetterTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {coverLetter.companyName} - {coverLetter.jobRoleName}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 ${
                      selectedCoverLetterId === coverLetter.coverLetterId
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  최종 수정: {formatDate(coverLetter.updatedAt)}
                </p>
              </button>
            ))}

            {/* Intersection Observer의 대상이 되는 div */}
            <div ref={observerTarget} className="h-4 w-full" />
          </>
        )}

        {/* 로딩 표시 */}
        {isFetchingNextPage && (
          <div className="py-4 flex justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {/* 더 이상 데이터가 없을 때 */}
        {!hasNextPage && coverLetters.length > 0 && (
          <div className="pb-2 text-center text-sm text-muted-foreground">
            모든 자기소개서를 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default CoverLetterSelectionPanel;
