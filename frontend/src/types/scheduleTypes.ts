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
  coverLetterId: number | 'none' | null;
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
  서류작성전: "bg-emerald-200",
  서류작성중: "bg-sky-200",
  미제출: "bg-slate-200",
  // IN_PROGRESS - 중간 밝기 색
  서류제출: "bg-yellow-300",
  서류합격: "bg-amber-300",
  "1차합격": "bg-orange-300",
  "2차합격": "bg-lime-300",
  "3차합격": "bg-green-300",
  진행중: "bg-pink-300",
  // DONE - 진한 색
  최종합격: "bg-purple-300",
  최종탈락: "bg-teal-400",
  서류탈락: "bg-violet-400",
  "1차탈락": "bg-emerald-400",
  "2차탈락": "bg-cyan-400",
  "3차탈락": "bg-indigo-400",
  전형종료: "bg-rose-200",
};

export const statusBorderColorMap: Record<string, string> = {
  서류작성전: "border-l-emerald-200",
  서류작성중: "border-l-sky-200",
  미제출: "border-l-slate-200",
  // IN_PROGRESS
  서류제출: "border-l-yellow-300",
  서류합격: "border-l-amber-300",
  "1차합격": "border-l-orange-300",
  "2차합격": "border-l-lime-300",
  "3차합격": "border-l-green-300",
  진행중: "border-l-pink-300",
  // DONE
  최종합격: "border-l-purple-400",
  최종탈락: "border-l-teal-400",
  서류탈락: "border-l-violet-300",
  "1차탈락": "border-l-emerald-400",
  "2차탈락": "border-l-cyan-400",
  "3차탈락": "border-l-indigo-400",
  전형종료: "border-l-rose-200",
};
