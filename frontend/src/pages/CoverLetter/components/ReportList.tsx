interface ReportListProps {
  nowStep: number;
}

function ReportList({ nowStep }: ReportListProps) {
  console.log(nowStep, " 으아아아아악ㄱㄴ");

  return (
    <div className="border w-[50rem] border-t-4 border-t-primary rounded-xl p-10 ">
      {nowStep <= 1 && (
        <>
          <div className="text-2xl font-bold pb-3 border-b-1">
            1. 기업분석 선택하기
          </div>
          <div className="text-4xl font-semibold mt-10">
            <p className="mb-2">원하시는 기업분석 자료를</p>
            <p>선택해 주세요!</p>
          </div>

          <div className="border grid md:grid-cols-3 mt-10 grid-cols-2">
            <div className="border h-40"></div>
            <div className="border h-40"></div>
            <div className="border h-40"></div>

            <div className="border h-40"></div>
            <div className="border h-40"></div>
            <div className="border h-40"></div>
          </div>
        </>
      )}
      {nowStep === 3 && <></>}
    </div>
  );
}

export default ReportList;
