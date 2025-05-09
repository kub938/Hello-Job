import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import InputChat from "./components/InputChat";
import { useCoverLetterStore } from "@/store/coverLetterStore";
import CoverLetterEditor from "./components/CoverLetterEditor";
import { useParams } from "react-router";
import {
  useGetContentStatus,
  useGetCoverLetter,
  useGetCoverLetterContentIds,
  useSaveCoverLetter,
  useSendMessage,
} from "@/hooks/coverLetterHooks";
import QuestionStep from "./components/QuestionStep";
import { useIsMutating } from "@tanstack/react-query";
import { SyncLoader } from "react-spinners";
import { SaveCoverLetterRequest } from "@/types/coverLetterApiType";

function CoverLetter() {
  // 모든 훅을 컴포넌트 최상단에 배치
  const mutation = useSendMessage();
  const saveMutation = useSaveCoverLetter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { id: idParam } = useParams();
  const coverLetterId = idParam ? parseInt(idParam) : undefined;
  const { chatLog, addAiMessage } = useCoverLetterStore();

  // useState 훅 모음
  const [selectQuestionId, setSelectQuestionId] = useState(0); // 기본값 설정
  const [selectQuestionNumber, setSelectQuestionNumber] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [contentDetail, setContentDetail] = useState("");
  const [nowContentLength, setNowContentLength] = useState(0);
  //
  const sendLoading = useIsMutating({ mutationKey: ["send-message"] });
  // API 호출 관련 훅
  const { data: contents, isLoading: isContentsLoading } =
    useGetCoverLetterContentIds(coverLetterId || 0);
  const { data: coverLetter, isLoading } = useGetCoverLetter(
    selectQuestionId || 0
  );
  const { data: statusData } = useGetContentStatus(coverLetterId || 0);

  // 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    const firstContentId = contents?.contentIds?.[0];
    if (firstContentId !== undefined) {
      setSelectQuestionId(firstContentId);
    }
  }, [contents]);

  useEffect(() => {
    if (!coverLetter) return;
    setContentDetail(coverLetter.contentDetail);
    setNowContentLength(coverLetter.contentDetail.length);
  }, [coverLetter]);
  // 이벤트 핸들러

  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const onChangeContentDetail = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContentDetail(newValue);
    setNowContentLength(newValue.length);
  };

  const handleSelectQuestion = (selectId: number, selectNum: number) => {
    onSaveContent("changeStep");
    setSelectQuestionId(selectId);
    setSelectQuestionNumber(selectNum);
  };

  const onSubmitMessage = useCallback(() => {
    const message = {
      contentId: selectQuestionId,
      userMessage: inputValue,
      contentDetail: contentDetail,
    };
    mutation.mutate(message, {
      onSuccess: (data) => {
        console.log(data);
        addAiMessage(data.aiMessage);
      },
      onError: (error) => {
        console.error("메시지 전송 실패: ", error);
      },
    });

    const chatContainer = chatContainerRef.current;
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 0);
  }, [inputValue, contentDetail, selectQuestionId]);

  const chatStyles = useMemo(
    () => ({
      USER: {
        container: "flex flex-row-reverse",
        chatBubble:
          "break-all border max-w-92 px-3 py-3 rounded-xl bg-primary text-white",
      },
      AI: {
        container: "flex",
        chatBubble: "break-all border max-w-92 px-3 py-3 rounded-xl bg-muted",
      },
    }),
    []
  );

  const onSaveContent = (type: "changeStep" | "draft" | "save") => {
    const saveData: SaveCoverLetterRequest = {
      contentId: selectQuestionId,
      contentDetail: contentDetail,
      contentStatus: "IN_PROGRESS",
    };

    if (type === "changeStep") {
      const status =
        statusData?.contentQuestionStatuses[selectQuestionNumber].contentStatus;
      if (status === "PENDING") {
        saveData.contentStatus = "IN_PROGRESS";
      } else if (status === "COMPLETED") {
        saveData.contentStatus = "COMPLETED";
      }
    }
    if (type === "save") {
      saveData.contentStatus = "COMPLETED";
    }

    saveMutation.mutate(saveData, {
      onSuccess: (data) => {
        console.log(data);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  // 조건부 렌더링 - 모든 훅 선언 이후에 배치
  if (!coverLetterId) {
    return <div>유효하지 않은 자기소개서 ID입니다.</div>;
  }

  if (isContentsLoading) {
    return <div>컨텐츠 로딩중 입니다.</div>;
  }

  if (!contents) {
    return <div>유효하지 않은 문항 번호 입니다.</div>;
  }

  if (isLoading) {
    return <div>자기소개서를 가져오는 중 입니다.</div>;
  }

  if (!coverLetter) {
    return <div>자기소개서 데이터를 불러오는데 실패했습니다.</div>;
  }

  if (!statusData) {
    return <div>statusData를 불러오는데 실패했습니다.</div>;
  }

  const QuestionStatuses = statusData.contentQuestionStatuses;

  return (
    <>
      <div className="flex mt-5 gap-3 items-start">
        <div className="bg-white border w-[50rem] border-t-4 border-t-primary rounded-xl px-4 py-4 ">
          <div className="text-2xl font-bold pb-1 ">첨삭 도우미</div>
          <div className="text-sm text-muted-foreground border-b-1 pb-1">
            원하시는 부분을 수정하며 자소서를 완성해보세요!
          </div>

          <div className="relative">
            <div
              ref={chatContainerRef}
              className="flex flex-col h-[76vh] grow overflow-y-auto gap-2 mt-2 pb-15"
            >
              {chatLog.map((chat, index) => (
                <div key={index} className={chatStyles[chat.sender].container}>
                  <div className={chatStyles[chat.sender].chatBubble}>
                    {chat.message}
                  </div>
                </div>
              ))}

              {sendLoading > 0 && (
                <div className="w-20 h-15 mb-4  border-black">
                  <SyncLoader color="#886bfb" size={10} />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 w-full">
              <InputChat
                sendLoading={sendLoading}
                setInputValue={setInputValue}
                inputValue={inputValue}
                onChangeInput={onChangeInput}
                onSubmitMessage={onSubmitMessage}
              ></InputChat>
            </div>
          </div>
        </div>

        <CoverLetterEditor
          onSaveContent={onSaveContent}
          CoverLetterData={coverLetter}
          onChangeContentDetail={onChangeContentDetail}
          nowContentLength={nowContentLength}
        />

        <QuestionStep
          selectQuestionNumber={selectQuestionNumber}
          QuestionStatuses={QuestionStatuses}
          handleSelectQuestion={handleSelectQuestion}
          selectQuestion={selectQuestionId}
        />
      </div>
    </>
  );
}

export default CoverLetter;
