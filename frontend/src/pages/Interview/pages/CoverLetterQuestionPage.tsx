import { useState, useRef, useEffect } from "react";
import {
  FileText,
  PlusCircle,
  RefreshCw,
  CheckCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/Button";
import { useNavigate } from "react-router";
import {
  useCreateCoverLetterQuestion,
  useGetCoverLetterQuestions,
  useSaveCoverLetterQuestions,
  useSelectCoverLetterQuestionComplete,
} from "@/hooks/interviewHooks";
import { toast } from "sonner";
import CreateCoverLetterQuestionModal from "../components/CreateCoverLetterQuestionModal";
import {
  CreateQuestionResponse,
  SaveQuestionRequest,
} from "@/types/interviewApiTypes";
import CoverLetterSelectionPanel from "../components/CoverLetterSelectionPanel";

function CoverLetterQuestionPage() {
  //state 관련
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<
    number | null
  >(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] =
    useState<CreateQuestionResponse | null>(null);

  //훅
  const navigate = useNavigate();
  const createQuestionMutation = useCreateCoverLetterQuestion();
  const saveQuestionsMutation = useSaveCoverLetterQuestions();
  const { data: questions, refetch } = useGetCoverLetterQuestions(
    selectedCoverLetterId
  );
  const selectQuestionCompleteMutation = useSelectCoverLetterQuestionComplete();

  useEffect(() => {
    // 이전 타이머가 있으면 clear
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // 새 타이머 설정 (300ms)
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);

    // 컴포넌트 언마운트나 searchTerm 변경 시 클린업
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

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
    saveQuestionsMutation.mutate(data, {
      onSuccess() {
        refetch();
        handleCloseModal();
        toast.info("선택된 질문이 저장되었습니다.");
      },
    });
  };

  const handleSelectCoverLetter = (id: number) => {
    if (selectedCoverLetterId === id) {
      return;
    }
    setSelectedCoverLetterId(id);
    setSelectedQuestions([]);
  };

  const handleSelectComplete = () => {
    if (!selectedCoverLetterId) {
      toast.warning("선택된 자기소개서가 없습니다");
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.warning("문항을 선택해 주세요");
      return;
    }

    selectQuestionCompleteMutation.mutate(
      {
        coverLetterId: selectedCoverLetterId,
        questionIdList: selectedQuestions,
      },
      {
        onSuccess: (response) => {
          navigate("/interview/prepare", { state: response });
        },
      }
    );
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
        {/* 왼쪽: 자기소개서 선택 패널 (컴포넌트화) */}
        <div className="lg:col-span-1">
          <CoverLetterSelectionPanel
            selectedCoverLetterId={selectedCoverLetterId}
            onSelectCoverLetter={handleSelectCoverLetter}
          />
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
                  questions
                    .filter((question) =>
                      question.question
                        .toLowerCase()
                        .includes(debouncedSearchTerm.toLowerCase())
                    )
                    .map((question) => {
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
                              {isSelected && (
                                <CheckCircle className="w-4 h-4" />
                              )}
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
                    {debouncedSearchTerm
                      ? "검색 결과가 없습니다."
                      : "질문이 없습니다."}
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
          onClick={handleSelectComplete}
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
