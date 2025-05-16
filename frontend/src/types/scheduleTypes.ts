export enum ScheduleStatusStep {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export interface ScheduleStatus {
  name: string;
  value: string;
  step: ScheduleStatusStep;
}

export interface Schedule {
  scheduleId: number;
  scheduleTitle: string;
  scheduleMemo: string | null;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  scheduleStatusName: string;
  scheduleStatusStep: ScheduleStatusStep;
  coverLetterId: number | "none" | null;
}

export interface ScheduleCoverLetter {
  coverLetterId: number;
  coverLetterTitle: string;
  updatedAt: string;
}

export interface ScheduleInputStoreType {
  inputData: {
    scheduleTitle: string;
    scheduleMemo: string | null;
    scheduleStartDate: string | null;
    scheduleEndDate: string | null;
    scheduleStatusName: string;
    coverLetterId: number | null;
  };

  setScheduleTitle: (title: string) => void;
  setScheduleMemo: (memo: string | null) => void;
  setScheduleStartDate: (startDate: string | null) => void;
  setScheduleEndDate: (endDate: string | null) => void;
}

export const scheduleStatusList: Record<ScheduleStatusStep, ScheduleStatus[]> =
  {
    [ScheduleStatusStep.PENDING]: [
      {
        name: "서류작성전",
        value: "서류작성전",
        step: ScheduleStatusStep.PENDING,
      },
      {
        name: "서류작성중",
        value: "서류작성중",
        step: ScheduleStatusStep.PENDING,
      },
      { name: "미제출", value: "미제출", step: ScheduleStatusStep.PENDING },
    ],
    [ScheduleStatusStep.IN_PROGRESS]: [
      {
        name: "서류제출",
        value: "서류제출",
        step: ScheduleStatusStep.IN_PROGRESS,
      },
      {
        name: "서류합격",
        value: "서류합격",
        step: ScheduleStatusStep.IN_PROGRESS,
      },
      {
        name: "1차합격",
        value: "1차합격",
        step: ScheduleStatusStep.IN_PROGRESS,
      },
      {
        name: "2차합격",
        value: "2차합격",
        step: ScheduleStatusStep.IN_PROGRESS,
      },
      {
        name: "3차합격",
        value: "3차합격",
        step: ScheduleStatusStep.IN_PROGRESS,
      },
      {
        name: "진행중",
        value: "진행중",
        step: ScheduleStatusStep.IN_PROGRESS,
      },
    ],
    [ScheduleStatusStep.DONE]: [
      { name: "최종합격", value: "최종합격", step: ScheduleStatusStep.DONE },
      { name: "최종탈락", value: "최종탈락", step: ScheduleStatusStep.DONE },
      { name: "서류탈락", value: "서류탈락", step: ScheduleStatusStep.DONE },
      { name: "1차탈락", value: "1차탈락", step: ScheduleStatusStep.DONE },
      { name: "2차탈락", value: "2차탈락", step: ScheduleStatusStep.DONE },
      { name: "3차탈락", value: "3차탈락", step: ScheduleStatusStep.DONE },
      { name: "전형종료", value: "전형종료", step: ScheduleStatusStep.DONE },
    ],
  };

export const stepLabelMap = {
  [ScheduleStatusStep.PENDING]: {
    label: "준비 중인 일정",
    borderColor: "border-l-green-400",
    backgroundColor: "bg-green-100",
    textColor: "text-green-400",
  },
  [ScheduleStatusStep.IN_PROGRESS]: {
    label: "진행 중인 일정",
    borderColor: "border-l-yellow-400",
    backgroundColor: "bg-yellow-100",
    textColor: "text-yellow-400",
  },
  [ScheduleStatusStep.DONE]: {
    label: "종료된 일정",
    borderColor: "border-l-slate-400",
    backgroundColor: "bg-slate-100",
    textColor: "text-slate-400",
  },
};

export const statusColorMap: Record<string, string> = {
  // PENDING - 연한 색
  서류작성전: "bg-[#E6BEAE]",
  서류작성중: "bg-[#EFD3D7]",
  미제출: "bg-[#D9D9D9]",
  // IN_PROGRESS - 중간 밝기 색
  서류제출: "bg-[#FFE97F]",
  서류합격: "bg-[#FFFB00]",
  "1차합격": "bg-[#FFCC00]",
  "2차합격": "bg-[#EEEF20]",
  "3차합격": "bg-[#C4F72C]",
  진행중: "bg-[#9EF01A]",
  // DONE - 진한 색
  최종합격: "bg-[#AF9BFF]",
  최종탈락: "bg-[#C1CDF9]",
  서류탈락: "bg-[#B0D3F0]",
  "1차탈락": "bg-[#A8CCFC]",
  "2차탈락": "bg-[#8EB5F0]",
  "3차탈락": "bg-[#64B5F6]",
  전형종료: "bg-[#DABFFF]",
};

export const statusBorderColorMap: Record<string, string> = {
  서류작성전: "border-l-[#E6BEAE]",
  서류작성중: "border-l-[#EFD3D7]",
  미제출: "border-l-[#D9D9D9]",
  // IN_PROGRESS
  서류제출: "border-l-[#FFE97F]",
  서류합격: "border-l-[#FFFB00]",
  "1차합격": "border-l-[#FFCC00]",
  "2차합격": "border-l-[#EEEF20]",
  "3차합격": "border-l-[#C4F72C]",
  진행중: "border-l-[#9EF01A]",
  // DONE
  최종합격: "border-l-[#AF9BFF]",
  최종탈락: "border-l-[#C1CDF9]",
  서류탈락: "border-l-[#B0D3F0]",
  "1차탈락": "border-l-[#A8CCFC]",
  "2차탈락": "border-l-[#8EB5F0]",
  "3차탈락": "border-l-[#64B5F6]",
  전형종료: "border-l-[#DABFFF]",
};
