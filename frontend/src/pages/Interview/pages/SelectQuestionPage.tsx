import { Button } from "@/components/Button";
import {
  useGetQuestions,
  useSelectQuestionComplete,
} from "@/hooks/interviewHooks";
import { useInterviewStore } from "@/store/interviewStore";
import { StickyNote, CheckCircle, Search } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

function SelectQuestionPage() {
  const [selectQuestions, setSelectQuestions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // const { category } = useParams();
  const { selectCategory } = useInterviewStore();
  const navigate = useNavigate();
  const location = useLocation();

  //이거 가지고
  const { interviewId, interviewVideoId } = location.state || {};
  console.log(interviewId, interviewVideoId);

  //react query hooks
  const questionList = useGetQuestions(selectCategory);
  const selectCompleteMutation = useSelectQuestionComplete();

  // 문항 선택
  const handleSelectQuestions = (selectQuestionsId: number) => {
    if (selectQuestions.includes(selectQuestionsId)) {
      setSelectQuestions(
        selectQuestions.filter((id) => id !== selectQuestionsId)
      );
    } else {
      if (selectQuestions.length >= 5) {
        toast.warning("5문항넘게 선택하실 수 없습니다.");
        return;
      }
      setSelectQuestions([...selectQuestions, selectQuestionsId]);
    }
  };

  const handleSelectComplete = (e: React.MouseEvent) => {
    if (selectQuestions.length === 0) {
      e.preventDefault();
      toast.error("문항을 1개 이상 선택해 주세요");
      return;
    }

    selectCompleteMutation.mutate(
      {
        category: selectCategory,
        selectData: {
          interviewVideoId: interviewVideoId,
          questionIdList: selectQuestions,
        },
      },
      {
        onSuccess: (response) => {
          console.log("문항선택 성공", response);
          navigate("/interview/prepare", { state: response });
        },
      }
    );
  };
  // 검색 필터링

  if (!questionList || !questionList.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredQuestions = questionList.data.filter((question) =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-secondary-foreground">
          단일 문항 연습
        </h2>
        <p className="text-muted-foreground text-lg">
          연습하고 싶은 질문을 선택해주세요 ({selectQuestions.length}개 선택됨 /
          최대 5개까지 가능)
        </p>
      </div>

      {/* 검색창 */}
      <div className="relative mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="질문 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        <div className="mb-5 flex justify-between items-center">
          <h3 className="text-xl font-bold text-secondary-foreground flex items-center">
            <span className="bg-primary/10 text-primary rounded-full p-1.5 mr-2">
              <StickyNote className="h-5 w-5" />
            </span>
            {(selectCategory === "cover-letter" && "자기소개서") ||
              (selectCategory === "cs" && "CS") ||
              (selectCategory === "personality" && "인성")}{" "}
            질문 리스트
          </h3>
          {selectQuestions.length > 0 && (
            <div className="text-sm text-primary font-medium">
              {selectQuestions.length}개 선택됨
            </div>
          )}
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredQuestions.map((question, index) => {
              const isSelected = selectQuestions.includes(
                question.questionBankId
              );

              return (
                <div
                  onClick={() => handleSelectQuestions(question.questionBankId)}
                  key={index}
                  className={`group relative rounded-lg border p-4 transition-all${
                    isSelected
                      ? "border-primary bg-secondary-light shadow-sm"
                      : "border-border bg-white hover:border-primary/30 hover:bg-secondary-light/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-grow">
                      <div
                        className={`flex-shrink-0 rounded-full w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <CheckCircle className="w-4 h-4" />}
                      </div>

                      <p className="text-secondary-foreground font-medium">
                        {question.question}
                      </p>
                    </div>

                    <button
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-all ml-auto flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 메모 기능 처리
                      }}
                    >
                      <StickyNote className="h-4 w-4" />
                      메모하기
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            onClick={() => navigate(-1)}
            variant={"white"}
            className="border border-border px-10 py- "
          >
            이전
          </Button>
          <Button
            className={`w-30 ${
              selectQuestions.length > 0
                ? "bg-primary text-primary-foreground hover:bg-accent"
                : "bg-muted-foreground/30 text-muted cursor-not-allowed"
            }`}
            onClick={(e) => {
              handleSelectComplete(e);
            }}
          >
            선택 완료 ({selectQuestions.length})
          </Button>
        </div>
      </div>

      {/* 스타일 정의 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}

export default SelectQuestionPage;
