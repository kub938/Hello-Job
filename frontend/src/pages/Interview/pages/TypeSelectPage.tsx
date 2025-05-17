import { Button } from "@/components/Button";
import { Mic, Users } from "lucide-react";
import { useState } from "react";
import TypeSelectModal from "../components/CategorySelectModal";
import { interviewType } from "@/types/interviewType";
import { useInterviewStore } from "@/store/interviewStore";

function TypeSelectPage() {
  const [isOpenSelectModal, setIsOpenSelectModal] = useState(false);
  const { setSelectInterviewType } = useInterviewStore();

  const handleOpenSelectQuestionModal = (type: interviewType) => {
    if (type === "question") {
      setSelectInterviewType("question");
      setIsOpenSelectModal(true);
    } else if (type === "practice") {
      setSelectInterviewType("practice");
      setIsOpenSelectModal(true);
    }
  };

  const onCloseSelectQuestionModal = () => {
    setIsOpenSelectModal(false);
  };

  return (
    <>
      {isOpenSelectModal && (
        <TypeSelectModal onClose={onCloseSelectQuestionModal} />
      )}

      <div className="my-5 flex flex-col items-center ">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">면접 유형 선택</h2>
          <p className="text-gray-600">원하는 면접 유형을 선택해주세요</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg border flex flex-col justify-center w-130 h-110 border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-light">
              <Mic className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-4 text-center text-xl font-bold">
              선택 문항 연습
            </h3>
            <p className="mb-6 text-center text-gray-600">
              특정 질문에 대한 답변을 집중적으로 연습하고 피드백을 받아보세요
            </p>
            <div className="mb-4 text-center text-sm text-gray-500">
              선택한 문항 갯수에 따라 약 5~20분 소요
            </div>
            <Button
              onClick={() => handleOpenSelectQuestionModal("question")}
              variant={"white"}
              className="h-12"
            >
              선택 문항 시작하기
            </Button>
          </div>

          <div className="rounded-lg border flex flex-col justify-center w-130 h-110 border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-light">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="mb-4 text-center text-xl font-bold">
              랜덤 문항 면접
            </h3>
            <p className="mb-6 text-center text-gray-600">
              실제 면접처럼 여러 질문에 대해 연속적으로 답변해보세요
            </p>
            <div className="mb-4 text-center text-sm text-gray-500">
              약 20분 소요
            </div>
            <Button
              onClick={() => handleOpenSelectQuestionModal("practice")}
              className="h-12"
            >
              랜덤 문항 연습
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-secondary-light p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/30 text-sm font-medium text-accent">
              TIP
            </div>
            <div>
              <h4 className="mb-2 font-medium">
                처음 면접 연습을 시작하시나요?
              </h4>
              <p className="text-sm text-gray-600">
                단일 문항 연습부터 시작해보세요. 질문별로 피드백을 받으며
                일차적으로 실력을 향상시킬 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TypeSelectPage;
