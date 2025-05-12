import MypageHeader from "./MypageHeader";
import ScheduleCard from "./ScheduleCard";
import ScheduleStepCard from "./ScheduleStepCard";

const scheduleList = [
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 전",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 전",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 전",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 전",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 전",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 전",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 중",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "지원 예정",
    statusName: "지원 대기",
    statusStep: "지원 중",
  },
  {
    title: "HELLO JOB 프로젝트",
    date: "2025.05.10",
    status: "최종 합격",
    statusName: "최종 합격",
    statusStep: "지원 후",
  },
];

const stepLabelMap: Record<
  string,
  { label: string; borderColor: string; color: string; textColor: string }
> = {
  "지원 전": {
    label: "지원 준비",
    borderColor: "border-slate-400",
    color: "bg-slate-100",
    textColor: "text-slate-400",
  },
  "지원 중": {
    label: "진행 중",
    borderColor: "border-yellow-400",
    color: "bg-yellow-100",
    textColor: "text-yellow-400",
  },
  "지원 후": {
    label: "최종 결과",
    borderColor: "border-green-400",
    color: "bg-green-100",
    textColor: "text-green-400",
  },
};

function Schedule() {
  return (
    <div className="flex-1 p-4 md:p-6 md:ml-56 transition-all duration-300">
      <MypageHeader title="일정 관리" />
      <div className="flex flex-row gap-6 overflow-x-auto px-2">
        {Object.entries(stepLabelMap).map(([stepKey, stepValue]) => (
          <div key={stepKey} className="w-1/3">
            <ScheduleStepCard statusStep={stepValue.label}>
              <ScheduleCard
                scheduleList={scheduleList.filter(
                  (item) => item.statusStep === stepKey
                )}
                color={stepValue.color}
                borderColor={stepValue.borderColor}
                textColor={stepValue.textColor}
              />
            </ScheduleStepCard>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
