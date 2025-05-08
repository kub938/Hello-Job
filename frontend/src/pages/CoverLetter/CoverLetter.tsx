import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import InputChat from "./components/InputChat";
import { useCoverLetterStore } from "@/store/coverLetterStore";
import CoverLetterEditor from "./components/CoverLetterEditor";
import { useParams } from "react-router";
import {
  useGetCoverLetter,
  useGetCoverLetterContentIds,
  useSendMessage,
} from "@/hooks/coverLetterHooks";

function CoverLetter() {
  // 모든 훅을 컴포넌트 최상단에 배치
  const mutation = useSendMessage();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { id: idParam } = useParams();
  const id = idParam ? parseInt(idParam) : undefined;
  const { chatLog, addAiMessage } = useCoverLetterStore();

  // useState 훅 모음
  const [selectQuestion, setSelectQuestion] = useState(0); // 기본값 설정
  const [inputValue, setInputValue] = useState("");
  const [contentDetail, setContentDetail] = useState("");
  const [nowContentLength, setNowContentLength] = useState(0);

  // API 호출 관련 훅
  const { data: contents, isLoading: isContentsLoading } =
    useGetCoverLetterContentIds(id || 0);

  const { data, isLoading } = useGetCoverLetter(selectQuestion || 0);

  // 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    const firstContentId = contents?.contentIds?.[0];
    if (firstContentId !== undefined) {
      setSelectQuestion(firstContentId);
    }
  }, [contents]);

  useEffect(() => {
    if (data?.contentDetail) {
      setNowContentLength(data.contentDetail.length);
    }
  }, [data]);
  // 이벤트 핸들러
  const onChangeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const onChangeContentDetail = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentDetail(e.target.value);
    setNowContentLength(e.target.textLength);
  };

  // const handleSelectQuestion = (selectNum: number) => {
  //   setSelectQuestion(selectNum);
  // };

  const onSubmitMessage = useCallback(() => {
    const message = {
      contentId: selectQuestion,
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
  }, [inputValue, contentDetail, selectQuestion]);

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

  // 조건부 렌더링 - 모든 훅 선언 이후에 배치
  if (!id) {
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

  if (!data) {
    return <div>자기소개서 데이터를 불러오는데 실패했습니다.</div>;
  }

  // const QuestionStatuses = data.summary.contentQuestionStatuses;

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
            </div>
            <div className="absolute bottom-0 w-full">
              <InputChat
                setInputValue={setInputValue}
                inputValue={inputValue}
                onChangeInput={onChangeInput}
                onSubmitMessage={onSubmitMessage}
              ></InputChat>
            </div>
          </div>
        </div>

        <CoverLetterEditor
          CoverLetterData={data}
          onChangeContentDetail={onChangeContentDetail}
          nowContentLength={nowContentLength}
        />

        {/* <QuestionStep
          QuestionStatuses={QuestionStatuses}
          handleSelectQuestion={handleSelectQuestion}
          selectQuestion={selectQuestion}
        /> */}
      </div>
    </>
  );
}

export default CoverLetter;
