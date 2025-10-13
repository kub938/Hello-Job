import { Button } from "@/components/Button";
import {
  useGetQuestions,
  useSelectQuestionComplete,
} from "@/hooks/interviewHooks";
import { useInterviewStore } from "@/store/interviewStore";
import { StickyNote, Search } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import QuestionItem from "../components/QuestionItem";

// CS 카테고리 타입 정의
type CSCategory =
  | ""
  | "네트워크"
  | "운영체제"
  | "컴퓨터구조"
  | "데이터베이스"
  | "알고리즘"
  | "보안"
  | "자료구조"
  | "기타";

function SelectQuestionPage() {
  const [selectQuestions, setSelectQuestions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCSCategory, setActiveCSCategory] = useState<CSCategory>(""); // CS 카테고리 필터 상태
  const { selectCategory } = useInterviewStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { interviewId, interviewVideoId } = location.state || {};
  console.log(interviewId, interviewVideoId);

  // react query hooks
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

  if (!questionList || !questionList.data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // CS 카테고리 목록 추출 (CS 카테고리인 경우만)
  const csCategories: CSCategory[] =
    selectCategory === "cs"
      ? (Array.from(
          new Set(questionList.data.map((q: any) => q.category))
        ) as CSCategory[])
      : [];

  // 검색 필터링 및 카테고리 필터링
  const filteredQuestions = questionList.data.filter((question: any) => {
    const matchesSearch = question.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // CS 카테고리인 경우 카테고리 필터링 추가
    if (selectCategory === "cs" && activeCSCategory) {
      return matchesSearch && question.category === activeCSCategory;
    }

    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-secondary-foreground">
          선택 문항 연습
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

      {/* CS 카테고리 탭 추가 (CS 카테고리인 경우만 표시) */}
      {selectCategory === "cs" && csCategories.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setActiveCSCategory("")}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeCSCategory === ""
                  ? "bg-primary text-white"
                  : "bg-secondary-light text-secondary-foreground hover:bg-primary/10"
              }`}
            >
              전체
            </button>
            {csCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCSCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeCSCategory === category
                    ? "bg-primary text-white"
                    : "bg-secondary-light text-secondary-foreground hover:bg-primary/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

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
            {selectCategory === "cs" &&
              activeCSCategory &&
              ` - ${activeCSCategory}`}
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
            {/* CS 카테고리인 경우 카테고리별 그룹화 */}
            {selectCategory === "cs" && activeCSCategory === ""
              ? // 전체 카테고리를 보여줄 때는 카테고리별로 그룹화
                csCategories.map((category) => {
                  const categoryQuestions = filteredQuestions.filter(
                    (q: any) => q.category === category
                  );

                  if (categoryQuestions.length === 0) return null;

                  return (
                    <div key={category} className="mb-6">
                      <h4 className="font-semibold text-md text-secondary-foreground mb-3 border-l-4 border-primary pl-3">
                        {category} ({categoryQuestions.length})
                      </h4>
                      <div className="space-y-3">
                        {categoryQuestions.map((question) => (
                          <QuestionItem
                            key={question.questionBankId}
                            question={question}
                            isSelected={selectQuestions.includes(
                              question.questionBankId
                            )}
                            onSelect={() =>
                              handleSelectQuestions(question.questionBankId)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              : // 특정 카테고리나 CS가 아닌 경우 일반 목록
                filteredQuestions.map((question: any) => (
                  <QuestionItem
                    key={question.questionBankId}
                    question={question}
                    isSelected={selectQuestions.includes(
                      question.questionBankId
                    )}
                    onSelect={() =>
                      handleSelectQuestions(question.questionBankId)
                    }
                  />
                ))}
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
    </div>
  );
}

export default SelectQuestionPage;
