import FormInput from "@/components/Common/FormInput";
import { useState } from "react";

function InputQuestion() {
  const headerStyle =
    "w-full text-primary bg-secondary-light rounded-t-2xl py-3 px-4 font-semibold";
  const [charCount, setCharCount] = useState(0);
  return (
    <>
      <form action="" className="border w-full rounded-2xl">
        <div className={headerStyle}>1번 문항</div>
        <div className="mx-4 flex flex-col gap-3">
          <div className="flex gap-3 mt-3">
            <FormInput
              type="text"
              width="35rem"
              height="3rem"
              name="contentQuestion"
              className="border"
              placeholder="문항을 입력해 주세요"
            />
            <FormInput
              type="text"
              width="7rem"
              height="3rem"
              name="contentLength"
              placeholder="글자수"
            />
          </div>
          <div className="flex gap-8">
            <div className="w-[50%]">
              <div className={`${headerStyle}`}>프로젝트</div>
              <div className="flex flex-col gap-2.5 border p-3 rounded-b-xl">
                <div className="cursor-pointer border border-l-4 border-l-accent py-3 truncate px-5 rounded-lg">
                  Hello Job 프로젝트
                </div>
                <div className="border border-transparent py-3 px-5 text-text-muted-foreground rounded-lg bg-background hover:bg-secondary-light hover:text-black hover:border hover:border-secondary">
                  + 프로젝트 연결하기
                </div>
              </div>
            </div>

            <div className="w-[50%]">
              <div className={`${headerStyle}`}>경험</div>
              <div className="flex flex-col gap-2.5 border p-3 rounded-b-xl">
                <div className="border border-transparent py-3 px-5 text-text-muted-foreground rounded-lg bg-background hover:bg-secondary-light hover:text-black hover:border hover:border-secondary">
                  + 경험 연결하기
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className={headerStyle}>내용 추가</div>
            <textarea
              name="contentFirstPrompt"
              placeholder="추가하고 싶은 내용들을 적어주세요!"
              maxLength={200}
              rows={5}
              cols={50}
              className="bg-white resize-none border rounded-b-xl w-full p-4 pb-10 "
              onChange={(e) => setCharCount(e.target.value.length)}
            />
            <span className="absolute mt-10 right-5 bottom-5 text-sm text-text-muted-foreground">
              {charCount} / 200
            </span>
          </div>
        </div>
      </form>
      <div className="mt-2 py-3 px-5 border text-text-muted-foreground rounded-lg bg-background hover:bg-secondary-light hover:text-black hover:border hover:border-secondary">
        + 문항 추가하기
      </div>
    </>
  );
}

export default InputQuestion;
