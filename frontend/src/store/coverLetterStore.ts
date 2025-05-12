import {
  ChatMessage,
  ChatStore,
  CoverLetterInputStoreType,
} from "@/types/coverLetterStoreTypes";
import { CoverLetterRequestContent } from "@/types/coverLetterTypes";
import { toast } from "sonner";
import { create } from "zustand";

export const useCoverLetterStore = create<ChatStore>((set) => ({
  chatLog: [],

  setChatLog: (chatLogData: ChatMessage[]) => {
    console.log("chatLogData: ", ...chatLogData);
    set(() => ({
      chatLog: [
        {
          sender: "ai",
          message:
            "안녕하세요! 저는 당신의 자소서 멘토, 헬로잡 이에요. 문장 하나하나를 다듬고, 지원하는 직무와 기업에 맞는 방향성까지 안내해 드려요. 단순한 교정이 아닌, 진짜 설득력 있는 자소서를 함께 만들어봐요!",
        },
        ...chatLogData,
      ],
    }));
  },

  addUserMessage: (message: string) => {
    set((prev) => ({
      chatLog: [...prev.chatLog, { sender: "user", message }],
    }));
  },
  addAiMessage: (message: string) => {
    set((prev) => ({
      chatLog: [...prev.chatLog, { sender: "ai", message }],
    }));
  },
}));

export const useCoverLetterInputStore = create<CoverLetterInputStoreType>(
  (set) => ({
    inputData: {
      companyAnalysisId: null,
      jobRoleAnalysisId: null,
      coverLetterTitle: "",
      contents: [
        {
          contentQuestion: "",
          contentNumber: 1,
          contentExperienceIds: [],
          contentProjectIds: [],
          contentLength: 0,
          contentFirstPrompt: "",
        },
      ],
    },

    setCoverLetterTitle: (title: string) => {
      set((state) => ({
        inputData: {
          ...state.inputData,
          coverLetterTitle: title,
        },
      }));
    },
    setCompanyAnalysisId: (id: number | null) => {
      set((state) => ({
        inputData: {
          ...state.inputData,
          companyAnalysisId: id,
        },
      }));
    },

    setJobRoleAnalysisId: (id: number | null) => {
      set((state) => ({
        inputData: {
          ...state.inputData,
          jobRoleAnalysisId: id,
        },
      }));
    },

    setContentProjectIds: (contentIndex: number, projectIds: number[]) => {
      set((state) => ({
        inputData: {
          ...state.inputData,
          contents: state.inputData.contents.map((content, index) =>
            index === contentIndex
              ? { ...content, contentProjectIds: projectIds }
              : content
          ),
        },
      }));
    },

    setContentExperienceIds: (
      contentIndex: number,
      experienceIds: number[]
    ) => {
      set((state) => ({
        inputData: {
          ...state.inputData,
          contents: state.inputData.contents.map((content, index) =>
            index === contentIndex
              ? { ...content, contentExperienceIds: experienceIds }
              : content
          ),
        },
      }));
    },

    addQuestion: () =>
      set((state) => {
        if (state.inputData.contents.length >= 10) {
          toast.warning("최대 10개의 문항만 추가할 수 있습니다.");
          return state;
        }

        return {
          inputData: {
            ...state.inputData,
            contents: [
              ...state.inputData.contents,
              {
                contentQuestion: "",
                contentNumber: state.inputData.contents.length + 1,
                contentExperienceIds: [],
                contentProjectIds: [],
                contentLength: 0,
                contentFirstPrompt: "",
              },
            ],
          },
        };
      }),

    setAllQuestions: (contents: CoverLetterRequestContent[]) =>
      set((state) => ({
        inputData: {
          ...state.inputData,
          contents,
        },
      })),
  })
);
