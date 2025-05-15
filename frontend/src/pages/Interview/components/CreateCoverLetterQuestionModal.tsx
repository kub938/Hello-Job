import { useState, useEffect, useRef } from "react";
import { CheckCircle, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import {
  CreateQuestionResponse,
  SaveQuestionRequest,
} from "@/types/interviewApiTypes";

// 질문 저장 요청 인터페이스

interface CoverLetterQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetterId: number | null;
  generatedQuestions: CreateQuestionResponse | null;
  isLoading: boolean;
  onSaveQuestions: (data: SaveQuestionRequest) => void;
  isSaving: boolean;
}

function CreateCoverLetterQuestionModal({
  isOpen,
  onClose,
  coverLetterId,
  generatedQuestions,
  isLoading,
  onSaveQuestions,
  isSaving,
}: CoverLetterQuestionModalProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // 모달 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 모달이 열릴 때마다 선택된 질문 초기화
  useEffect(() => {
    if (isOpen) {
      setSelectedQuestions([]);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 질문 선택/해제 핸들러
  const toggleQuestion = (question: string) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter((q) => q !== question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  // 선택한 질문 저장 핸들러
  const handleSaveQuestions = () => {
    if (!coverLetterId) {
      toast.error("자기소개서 ID가 유효하지 않습니다.");
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.error("최소 1개 이상의 질문을 선택해주세요.");
      return;
    }

    const saveData: SaveQuestionRequest = {
      coverLetterId,
      coverLetterQuestion: selectedQuestions,
    };

    onSaveQuestions(saveData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="text-xl font-bold text-secondary-foreground">
            자기소개서 기반 질문
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-secondary-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-5 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                AI가 자기소개서 기반 질문을 생성 중입니다...
              </p>
            </div>
          ) : generatedQuestions?.coverLetterQuestion &&
            generatedQuestions.coverLetterQuestion.length > 0 ? (
            <div className="space-y-4">
              <p className="text-secondary-foreground mb-4">
                AI가 자기소개서 내용을 분석하여 면접 질문을 생성했습니다.
                활용하고 싶은 질문을 선택해주세요.
              </p>

              <div className="space-y-3 mt-4">
                {generatedQuestions.coverLetterQuestion.map(
                  (question, index) => {
                    const isSelected = selectedQuestions.includes(question);

                    return (
                      <div
                        key={index}
                        onClick={() => toggleQuestion(question)}
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
                            {question}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="text-sm text-primary font-medium text-right mt-4">
                {selectedQuestions.length}개 선택됨
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                질문 생성에 실패했습니다. 다시 시도해주세요.
              </p>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="p-5 border-t border-border flex justify-between">
          <Button
            variant="white"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-border text-secondary-foreground hover:bg-muted transition-colors"
          >
            취소
          </Button>

          <Button
            variant="default"
            onClick={handleSaveQuestions}
            disabled={selectedQuestions.length === 0 || isSaving}
            className="px-4 py-2 rounded-lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                저장 중...
              </>
            ) : (
              <>선택 질문 저장 ({selectedQuestions.length})</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateCoverLetterQuestionModal;
