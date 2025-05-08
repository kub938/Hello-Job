import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { getCoverLetterResponse } from "@/types/coverLetterApiType";

export interface CoverLetterEditorProps {
  onSaveContent: () => void;
  CoverLetterData: getCoverLetterResponse;
  onChangeContentDetail: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  nowContentLength: number;
}

function CoverLetterEditor({
  onSaveContent,
  CoverLetterData,
  onChangeContentDetail,
  nowContentLength,
}: CoverLetterEditorProps) {
  const [localContent, setLocalContent] = useState("");

  useEffect(() => {
    if (CoverLetterData?.contentDetail) {
      setLocalContent(CoverLetterData.contentDetail);
    }
  }, [CoverLetterData]);

  if (!CoverLetterData) {
    return null;
  }

  const { contentNumber, contentQuestion, contentLength } = CoverLetterData;

  // 로컬 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
    onChangeContentDetail(e); // 부모에게도 변경 사항 전달
  };

  return (
    <div className="bg-white border w-[50rem] rounded-xl px-4 py-4">
      <div className="text-sm text-muted-foreground pb-1">
        원하시는 부분을 수정하며 자소서를 완성해보세요!
      </div>
      <div className="text-2xl font-bold pb-2 ">
        {contentNumber + 1}. {contentQuestion}
      </div>

      <label htmlFor="자기소개서 수정화면" />
      <textarea
        name="contentDetail"
        id="contentDetail"
        className="break-all w-full p-3 h-[68vh] border resize-none"
        onChange={handleChange}
        placeholder="자기소개서를 작성 해 주세요"
        maxLength={contentLength}
        value={localContent}
      />
      <div className="text-right text-muted-foreground">
        {nowContentLength} / {contentLength}
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <Button onClick={onSaveContent} variant={"white"} className="w-20">
          임시저장
        </Button>
        <Button onClick={onSaveContent} className="w-20">
          저장
        </Button>
      </div>
    </div>
  );
}

export default CoverLetterEditor;
