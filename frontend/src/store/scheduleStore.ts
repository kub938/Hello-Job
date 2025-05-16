import { create } from "zustand";
import { ScheduleInputStoreType } from "@/types/scheduleTypes";

export const useScheduleStore = create<ScheduleInputStoreType>((set) => ({
  inputData: {
    scheduleTitle: "",
    scheduleMemo: null,
    scheduleStartDate: null,
    scheduleEndDate: null,
    scheduleStatusName: "",
    coverLetterId: null,
  },
  setScheduleTitle: (title: string) =>
    set((state) => ({
      inputData: { ...state.inputData, scheduleTitle: title },
    })),
  setScheduleMemo: (memo: string | null) =>
    set((state) => ({ inputData: { ...state.inputData, scheduleMemo: memo } })),
  setScheduleStartDate: (startDate: string | null) =>
    set((state) => ({
      inputData: { ...state.inputData, scheduleStartDate: startDate },
    })),
  setScheduleEndDate: (endDate: string | null) =>
    set((state) => ({
      inputData: { ...state.inputData, scheduleEndDate: endDate },
    })),
  setScheduleStatusName: (statusName: string) =>
    set((state) => ({
      inputData: { ...state.inputData, scheduleStatusName: statusName },
    })),
  setCoverLetterId: (coverLetterId: number | null) =>
    set((state) => ({
      inputData: { ...state.inputData, coverLetterId: coverLetterId },
    })),
}));
