import { useCoverLetterInputStore } from "@/store/coverLetterStore";
import QuestionItem from "./QuestionItem";
import { useEffect, useState } from "react";
import { CoverLetterRequestContent } from "@/types/coverLetterTypes";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useCreateCoverLetter } from "@/hooks/coverLetterHooks";
import FormInput from "@/components/Common/FormInput";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react"; // Lucide 아이콘 사용

interface InputQuestionProps {
  createModalOpen: boolean;
  setCreateModalOpen: (state: boolean) => void;
}

function InputQuestion({
  createModalOpen,
  setCreateModalOpen,
}: InputQuestionProps) {
  const mutation = useCreateCoverLetter();
  const { addQuestion, inputData, setAllQuestions, setCoverLetterTitle } =
    useCoverLetterInputStore();
  const [title, setTitle] = useState("");
  const [localContents, setLocalContents] = useState<
    CoverLetterRequestContent[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalContents(inputData.contents);
  }, []);

  // 문항 추가 함수
  const handleAddQuestion = () => {
    if (localContents.length >= 10) {
      toast.warning("최대 10개의 문항만 추가할 수 있습니다.");
      return;
    }
    addQuestion();
    setLocalContents([
      ...localContents,
      {
        contentQuestion: "",
        contentNumber: localContents.length + 1,
        contentExperienceIds: [],
        contentProjectIds: [],
        contentLength: 0,
        contentFirstPrompt: "",
      },
    ]);
  };
  // 문항 내용 업데이트 함수
  const updateQuestionData = (
    index: number,
    data: Partial<CoverLetterRequestContent>
  ) => {
    const newContents = [...localContents];
    newContents[index] = {
      ...newContents[index],
      ...data,
    };
    setLocalContents(newContents);
  };

  // 초안 생성
  const handleComplete = () => {
    // 이미 처리 중이면 중복 제출 방지
    if (mutation.isPending) {
      return;
    }

    const isValid = localContents.every(
      (content) => content.contentQuestion.trim() && content.contentLength > 0
    );

    if (!isValid) {
      toast.error("모든 문항의 질문과 글자수를 입력해주세요.");
      return;
    }

    if (!title.trim()) {
      toast.error("제목을 입력해 주세요");
      return;
    }
    const updatedData = {
      ...inputData,
      coverLetterTitle: title,
      contents: localContents,
    };
    setCoverLetterTitle(title);

    if (setAllQuestions) {
      setAllQuestions(localContents);
      setCreateModalOpen(false);
      // 새 객체로 API 호출
      mutation.mutate(updatedData, {
        onSuccess: (data) => {
          console.log("데이터 저장 성공", data);
          navigate(`${data.coverLetterId}`);
          toast.success("저장되었습니다.");
        },
        onError: (error) => {
          console.log("데이터 저장 실패", error);
          toast.error("저장 중 오류가 발생했습니다.");
        },
      });
    } else {
      toast.error("초안 생성 중 오류가 발생했습니다 다시 시도해 주세요.");
    }
  };

  const handleInputTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target) {
      setCreateModalOpen(false);
    }
  };
  const contentList = inputData.contents;
  return (
    <>
      {createModalOpen && (
        <div onClick={(e) => handleOverlayClick(e)} className="modal-overlay">
          <div className="modal-container h-auto flex flex-col ">
            <div className="font-semibold">자기소개서 제목을 입력해 주세요</div>
            <FormInput
              name="coverLetterTitle"
              require={true}
              placeholder="제목 입력"
              type="text"
              className="w-90 h-10 "
              onChange={handleInputTitle}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleComplete}
                className="w-15 mt-3"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>처리 중...</span>
                  </div>
                ) : (
                  "확인"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 전체 페이지에 로딩 오버레이 표시 (옵션) */}
      {mutation.isPending && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-lg font-medium">자기소개서 생성 중...</p>
            <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {contentList.map((content, contentIndex) => (
        <QuestionItem
          key={contentIndex}
          onUpdateQuestion={updateQuestionData}
          content={content}
          contentIndex={contentIndex}
        />
      ))}
      <div
        onClick={handleAddQuestion}
        className="mt-2 py-3 px-5 border text-text-muted-foreground rounded-lg bg-background hover:bg-secondary-light hover:text-black hover:border hover:border-secondary"
      >
        + 문항 추가하기
      </div>
    </>
  );
}

export default InputQuestion;
