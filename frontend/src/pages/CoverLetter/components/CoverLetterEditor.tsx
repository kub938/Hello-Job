import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import Modal from "@/components/Modal";
import { useCompleteCoverLetter } from "@/hooks/coverLetterHooks";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { CoverLetterEditorProps } from "@/types/coverLetterTypes";

function CoverLetterEditor({
  allContentData,
  onSaveContent,
  CoverLetterData,
  onChangeContentDetail,
  nowContentLength,
  totalContentLength,
  nowSelectContentNumber,
  coverLetterId,
}: CoverLetterEditorProps) {
  const [localContent, setLocalContent] = useState("");
  const [isOpenCompleteModal, setIsOpenCompleteModal] = useState(false);
  const completeCoverLetterMutation = useCompleteCoverLetter();
  const navigate = useNavigate();
  useEffect(() => {
    if (CoverLetterData?.contentDetail) {
      setLocalContent(CoverLetterData.contentDetail);
    }
  }, [CoverLetterData]);

  if (!CoverLetterData) {
    return null;
  }

  const { contentNumber, contentQuestion, contentLength } = CoverLetterData;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    onChangeContentDetail(e); // 부모에게도 변경 사항 전달
  };

  const handleCloseCompleteModal = () => {
    setIsOpenCompleteModal(false);
  };

  const handleOpenCompleteModal = () => {
    setIsOpenCompleteModal(true);
  };

  const onCompleteCreateCoverLetter = (coverLetterId: number) => {
    completeCoverLetterMutation.mutate(
      { coverLetterId, allContentData },
      {
        onSuccess: () => {
          toast.info("자기소개서 작성이 완료되었습니다");
          navigate("/mypage/cover-letter-list");
        },
      }
    );
  };
  return (
    <>
      <Modal
        title="자기소개서 작성 완료"
        isOpen={isOpenCompleteModal}
        onConfirm={() => onCompleteCreateCoverLetter(coverLetterId)}
        onClose={handleCloseCompleteModal}
      >
        <div className="ml-7 mt-1">
          <p>더 이상 수정하실 부분이 없으시면 </p>
          <p>확인 버튼을 눌러주세요</p>
        </div>
      </Modal>
      <div className="bg-white border w-[50rem] rounded-xl px-4 py-4">
        <div className="text-sm text-muted-foreground pb-1">
          원하시는 부분을 수정하며 자소서를 완성해보세요!
        </div>
        <div className="text-lg font-semibold pb-2 ">
          {contentNumber}. {contentQuestion}
        </div>

        <label htmlFor="자기소개서 수정화면" />
        <textarea
          name="contentDetail"
          id="contentDetail"
          className="break-all w-full p-3 h-[68vh] border resize-none"
          onChange={handleChange}
          placeholder="자기소개서를 작성 해 주세요"
          value={localContent}
        />
        <div className="text-right text-muted-foreground">
          <span
            className={nowContentLength > contentLength ? "text-error" : ""}
          >
            {nowContentLength}
          </span>
          <span> / {contentLength}</span>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            onClick={() => onSaveContent("draft")}
            variant={"white"}
            className="w-20"
          >
            임시저장
          </Button>

          {totalContentLength === nowSelectContentNumber ? (
            <Button onClick={handleOpenCompleteModal}>자기소개서 완성</Button>
          ) : (
            <Button onClick={() => onSaveContent("save")} className="w-20">
              저장
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default CoverLetterEditor;
