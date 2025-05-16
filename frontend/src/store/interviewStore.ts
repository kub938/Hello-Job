import { InterviewCategory } from "@/types/interviewApiTypes";
import { create } from "zustand/react";

export type InterviewType = "question" | "practice" | null;
export interface InterviewStore {
  selectCategory: InterviewCategory;
  selectInterviewType: InterviewType;
  selectCoverLetterId?: number | null;
  setSelectCategory: (category: InterviewCategory) => void;
  setSelectInterviewType: (type: InterviewType) => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  selectCategory: null,
  selectInterviewType: null,
  selectCoverLetterId: null,

  setSelectCategory: (category: InterviewCategory) => {
    set(() => ({
      selectCategory: category,
    }));
  },

  setSelectInterviewType: (type: InterviewType) => {
    set(() => ({
      selectInterviewType: type,
    }));
  },

  setSelectCoverLetterId: (id: number | null) => {
    set(() => ({
      selectCoverLetterId: id,
    }));
  },
}));
