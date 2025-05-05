import { ChatStore } from "@/types/coverLetterStoreTypes";
import { CoverLetterPostRequest } from "@/types/coverLetterTypes";
import { create } from "zustand";

export const useCoverLetterStore = create<ChatStore>((set) => ({
  chatLog: [
    {
      sender: "AI",
      message:
        "안녕하세요! 초안작성을 도와드립니다! 궁금하신점을 수정할 수 있도록 도와드려요!",
    },
  ],
  addUserMessage: (message: string) => {
    set((prev) => ({
      chatLog: [...prev.chatLog, { sender: "USER", message }],
    }));
  },
  addAiMessage: (message: string) => {
    set((prev) => ({
      chatLog: [...prev.chatLog, { sender: "AI", message }],
    }));
  },
}));

export const useCoverLetterInputStore = create((set) => ({
  companyAnalysisId: 0,
  jobRoleAnalysisId: null,
  contents: [
    {
      contentQuestion: "",
      contentNumber: 0,
      contentExperienceIds: [],
      contentProjectIds: [],
      contentLength: 0,
      contentFirstPrompt: "",
    },
  ],

  setCompanyAnalysisId: (id: number) => {
    set((state: CoverLetterPostRequest) => ({
      ...state,
      companyAnalysisId: id,
    }));
  },

  setJobRoleAnalysisId: (id: number) => {
    set((state: CoverLetterPostRequest) => ({
      ...state,
      jobRoleAnalysisId: id,
    }));
  },
}));
