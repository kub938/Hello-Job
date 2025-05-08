import { useCoverLetterInputStore } from "@/store/coverLetterStore";
import QuestionItem from "./QuestionItem";
import { useEffect, useState } from "react";
import { CoverLetterRequestContent } from "@/types/coverLetterTypes";
import { toast } from "sonner";
import { Button } from "@/components/Button";

function InputQuestion() {
  const { addQuestion, inputData, setAllQuestions } =
    useCoverLetterInputStore();

  const [localContents, setLocalContents] = useState<
    CoverLetterRequestContent[]
  >([]);

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

  useEffect(() => {
    console.log("Zustand 상태 업데이트됨:", inputData.contents);
  }, [inputData.contents]);

  // 완료 버튼 클릭 - Zustand 스토어에 저장
  const handleComplete = () => {
    // 필수 항목 검증 (선택 사항)
    // const isValid = localContents.every(
    //   (content) => content.contentQuestion && content.contentLength > 0
    // );

    // if (!isValid) {
    //   toast.error("모든 문항을 작성해주세요.");
    //   return;
    // }

    // Zustand 스토어 업데이트
    if (setAllQuestions) {
      setAllQuestions(localContents);
      toast.success("저장되었습니다.");
    } else {
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  const contentList = inputData.contents;
  return (
    <>
      {contentList.map((content, contentIndex) => (
        <QuestionItem
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
      <div className="flex justify-end mt-5">
        <Button className="w-30 h-10" onClick={handleComplete}>
          완료
        </Button>
      </div>
    </>
  );
}

export default InputQuestion;
