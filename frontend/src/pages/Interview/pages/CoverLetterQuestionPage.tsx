import { useState, useRef, useEffect } from "react";
import {
  FileText,
  ChevronRight,
  PlusCircle,
  RefreshCw,
  CheckCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useNavigate } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getCoverLetterList } from "@/api/mypageApi";
import {
  useCreateCoverLetterQuestion,
  useGetCoverLetterQuestions,
  useSaveCoverLetterQuestions,
} from "@/hooks/interviewHooks";
import { toast } from "sonner";
import CreateCoverLetterQuestionModal from "../components/CreateCoverLetterQuestionModal";
import {
  CreateQuestionResponse,
  SaveQuestionRequest,
} from "@/types/interviewApiTypes";

// // 생성된 질문 응답 인터페이스
// interface GeneratedQuestionsResponse {
//   coverLetterInterviewId: number;
//   coverLetterQuestionList: string[];
// }

function CoverLetterQuestionPage() {
  //state 관련
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<
    number | null
  >(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] =
    useState<CreateQuestionResponse | null>(null);

  //훅
  const navigate = useNavigate();
  const createQuestionMutation = useCreateCoverLetterQuestion();
  const saveQuestionsMutation = useSaveCoverLetterQuestions();
  const { data: questions } = useGetCoverLetterQuestions(selectedCoverLetterId);

  //무한 스크롤
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["coverLetterList"],
      queryFn: async ({ pageParam = 0 }) => {
        const response = await getCoverLetterList(Number(pageParam));
        return response.data;
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.last) return undefined;
        return lastPage.pageable.pageNumber + 1;
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

  // 모든 자기소개서 목록을 평탄화하여 하나의 배열로 만듦
  const coverLetters = data?.pages.flatMap((page) => page.content) || [];

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // 추가 질문 생성 핸들러
  const handleGenerateQuestions = () => {
    setIsModalOpen(true);

    if (!selectedCoverLetterId) {
      toast.error("자기소개서를 선택해 주세요");
      return;
    }

    // 기존 mutation 호출
    createQuestionMutation.mutate(selectedCoverLetterId, {
      onSuccess: (data) => {
        // 성공 시 생성된 질문 데이터 저장 및 모달 열기
        setGeneratedQuestions(data);
        setIsModalOpen(true);
      },
      onError: () => {
        toast.error("질문 생성에 실패했습니다. 다시 시도해 주세요.");
      },
    });
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // 선택한 질문 저장 핸들러
  const handleSaveQuestions = (data: SaveQuestionRequest) => {
    saveQuestionsMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-foreground mb-2">
          자기소개서 기반 질문 선택
        </h1>
        <p className="text-muted-foreground">
          면접에 활용할 자기소개서를 선택하고 질문을 고르세요.
        </p>
      </div>

      {/* 2단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 자기소개서 선택 패널 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-border p-5">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="w-5 h-5 text-primary mr-2" />내 자기소개서
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {status === "pending" ? (
                <div className="py-4 flex justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : status === "error" ? (
                <div className="text-center py-8 text-red-500">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </div>
              ) : coverLetters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  자기소개서가 없습니다.
                </div>
              ) : (
                <>
                  {coverLetters.map((coverLetter, index) => (
                    <button
                      key={`${coverLetter.coverLetterId}-${index}`}
                      onClick={() =>
                        setSelectedCoverLetterId(coverLetter.coverLetterId)
                      }
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
                            {coverLetter.companyName} -{" "}
                            {coverLetter.jobRoleName}
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
                <div className="py-4 text-center text-sm text-muted-foreground">
                  모든 자기소개서를 불러왔습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 질문 선택 및 생성 패널 */}
        <div className="lg:col-span-2">
          {selectedCoverLetterId ? (
            <div className="bg-white rounded-xl shadow-sm border border-border p-5">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold flex items-center">
                  <span className="bg-primary/10 text-primary rounded-full p-1.5 mr-2">
                    <FileText className="h-5 w-5" />
                  </span>
                  선택된 자기소개서 질문
                </h2>
                <div className="text-sm text-primary font-medium">
                  {selectedQuestions.length}개 선택됨
                </div>
              </div>

              {/* 검색창 */}
              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="질문 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              </div>

              {/* 질문 목록 */}
              <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-2">
                {questions && questions.length > 0 ? (
                  questions.map((question) => {
                    const isSelected = selectedQuestions.includes(
                      question.questionBankId
                    );
                    return (
                      <div
                        key={question.questionBankId}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedQuestions(
                              selectedQuestions.filter(
                                (id) => id !== question.questionBankId
                              )
                            );
                          } else {
                            if (selectedQuestions.length < 5) {
                              setSelectedQuestions([
                                ...selectedQuestions,
                                question.questionBankId,
                              ]);
                            } else {
                              // 최대 5개 선택 제한 - 실제로는 toast 메시지 등으로 알림
                              toast.error("최대 5개까지 선택할 수 있습니다.");
                            }
                          }
                        }}
                        className={`
                          group relative rounded-lg border p-4 transition-all cursor-pointer
                          ${
                            isSelected
                              ? "border-primary bg-secondary-light shadow-sm"
                              : "border-border bg-white hover:border-primary/30 hover:bg-secondary-light/50"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`
                            flex-shrink-0 rounded-full w-6 h-6 border-2 flex items-center justify-center 
                            transition-colors mt-0.5
                            ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-muted-foreground"
                            }
                          `}
                          >
                            {isSelected && <CheckCircle className="w-4 h-4" />}
                          </div>

                          <p className="flex-grow text-secondary-foreground">
                            {question.question}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "검색 결과가 없습니다." : "질문이 없습니다."}
                  </div>
                )}
              </div>

              {/* 추가 질문 생성 버튼 */}
              <div className="border-t border-border pt-5">
                <button
                  onClick={handleGenerateQuestions}
                  disabled={createQuestionMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-70"
                >
                  {createQuestionMutation.isPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      질문 생성 중...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      자기소개서 기반 추가 질문 생성하기
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  AI를 통해 자기소개서 내용에 맞는 추가 질문을 생성합니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-border p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
              <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium text-secondary-foreground mb-2">
                자기소개서를 선택해주세요
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                왼쪽에서 자기소개서를 선택하면 관련 질문 목록을 확인할 수
                있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="mt-8 flex justify-between">
        <Button
          variant={"white"}
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-lg border border-border text-secondary-foreground hover:bg-muted transition-colors"
        >
          이전
        </Button>

        <button
          className={`px-6 py-2.5 rounded-lg transition-colors ${
            selectedQuestions.length > 0
              ? "bg-primary text-primary-foreground hover:bg-accent"
              : "bg-muted-foreground/30 text-muted cursor-not-allowed"
          }`}
          disabled={selectedQuestions.length === 0}
        >
          선택 완료 ({selectedQuestions.length})
        </button>
      </div>

      <CreateCoverLetterQuestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coverLetterId={generatedQuestions?.coverLetterId || null}
        generatedQuestions={generatedQuestions}
        isLoading={createQuestionMutation.isPending}
        onSaveQuestions={handleSaveQuestions}
        isSaving={saveQuestionsMutation.isPending}
      />
    </div>
  );
}

export default CoverLetterQuestionPage;
