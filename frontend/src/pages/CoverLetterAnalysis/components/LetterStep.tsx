import { ArrowDown } from "lucide-react";

interface LetterStepProps {
  nowStep: number;
}

function LetterStep({ nowStep }: LetterStepProps) {
  const stepTitle = [
    "1. 기업/직무 선택",
    "2. 기업분석 선택",
    "3. 직무분석 선택",
    "4. 문항 입력",
    "5. 초안 생성 및 수정",
  ];

  const stepStyle = (select: boolean) => {
    return select
      ? "border flex justify-center items-center bg-primary text-white w-full h-15 text-lg font-semibold rounded-xl"
      : "border flex justify-center items-center w-full h-15 text-text-disabled text-lg font-semibold rounded-xl";
  };

  const stepArrowStyle = (select: boolean) => {
    return select ? "text-primary" : "text-text-disabled";
  };

  return (
    <aside className="select-none sticky  bg-white top-20 border w-[18rem] h-full flex flex-col items-center gap-3 p-9 ">
      {stepTitle.map((title, index) => (
        <>
          <div key={index} className={stepStyle(nowStep === index)}>
            {title}
          </div>
          {/* {stepArrowStyle(nowStep === index)} */}
          {index !== 4 && (
            <ArrowDown className={` ${stepArrowStyle(nowStep === index)}`} />
          )}
        </>
      ))}
    </aside>
  );
}

export default LetterStep;
