import { Button } from "@/components/Button";
import { CoverLetterResponse } from "@/types/coverLetterTypes";

export interface CoverLetterEditorProps {
  CoverLetterData: CoverLetterResponse;
  onChangeContentDetail: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  nowContentLength: number;
}

function CoverLetterEditor({
  CoverLetterData,
  onChangeContentDetail,
  nowContentLength,
}: CoverLetterEditorProps) {
  if (!CoverLetterData) {
    return;
  }
  console.log(CoverLetterData);
  const contentNumber = CoverLetterData.contentNumber;
  const contentDetail = CoverLetterData.contentDetail;
  const contentQuestion = CoverLetterData.contentQuestion;
  const contentLength = CoverLetterData.contentLength;

  return (
    <div className="bg-white border w-[50rem] rounded-xl px-4 py-4">
      <div className="text-sm text-muted-foreground  pb-1">
        원하시는 부분을 수정하며 자소서를 완성해보세요!
      </div>
      <div className="text-2xl font-bold pb-2 ">
        {contentNumber}. {contentQuestion}
      </div>

      <label htmlFor="자기소개서 수정화면" />
      <textarea
        name="contentDetail"
        id="contentDetail"
        className="break-all w-full p-3 h-[68vh] border resize-none"
        onChange={onChangeContentDetail}
        placeholder="자기소개서를 작성 해 주세요"
        maxLength={contentLength}
      >
        {contentDetail}
      </textarea>
      <div className="text-right text-muted-foreground">
        {nowContentLength} / {contentLength}
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <Button variant={"white"} className="w-20">
          임시저장
        </Button>
        <Button className="w-20">저장</Button>
      </div>
    </div>
  );
}

export default CoverLetterEditor;
