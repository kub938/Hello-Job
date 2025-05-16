import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { getCoverLetterResponse } from "@/types/coverLetterApiType";

export interface CoverLetterEditorProps {
  onSaveContent: (type: "changeStep" | "draft" | "save") => void;
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
        <span className={nowContentLength > contentLength ? "text-error" : ""}>
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
        <Button onClick={() => onSaveContent("save")} className="w-20">
          저장
        </Button>
      </div>
    </div>
  );
}

export default CoverLetterEditor;
