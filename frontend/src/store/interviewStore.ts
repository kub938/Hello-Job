import { InterviewCategory } from "@/types/interviewApiTypes";
import { create } from "zustand/react";

export interface InterviewStore {
  selectCategory: InterviewCategory;
  setSelectCategory: (category: InterviewCategory) => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  selectCategory: null,

  setSelectCategory: (category: InterviewCategory) => {
    set(() => ({
      selectCategory: category,
    }));
  },
}));
