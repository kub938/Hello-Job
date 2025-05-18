import {
  DeleteInterviewResultResponse,
  InterviewResultDetailResponse,
  InterviewResultListResponse,
} from "@/types/interviewResult";
import { authApi } from "./instance";
import {
  CreateQuestionResponse,
  InterviewCategory,
  InterviewVideoQuestionRequest,
  QuestionMemoRequest,
  QuestionResponse,
  SaveQuestionRequest,
  StartInterviewResponse,
  StartQuestionInterviewResponse,
} from "@/types/interviewApiTypes";

export const interviewApi = {
  // 질문 조회 API - 카테고리를 인자로 받아 해당 카테고리의 질문 목록 반환
  getCoverLetterQuestions: (coverLetterId: number | null | undefined) => {
    return authApi.get<QuestionResponse[]>(
      `/api/v1/interview/question/cover-letter/${coverLetterId}`
    );
  },

  getQuestions: (category: InterviewCategory) => {
    return authApi.get<QuestionResponse[]>(
      `/api/v1/interview/question/${category}`
    );
  },

  // 질문 상세 조회 API
  getQuestionDetail: (category: InterviewCategory, questionId: number) => {
    return authApi.get<QuestionResponse>(
      `/api/v1/interview/question/${category}/${questionId}`
    );
  },
  // 자기소개서 질문 생성 API
  createQuestion: (coverLetterId: number) => {
    return authApi.post<CreateQuestionResponse>(
      `/api/v1/interview/question/cover-letter`,
      {
        coverLetterId,
      }
    );
  },

  // 자기소개서 질문 저장 API
  saveQuestion: (questionData: SaveQuestionRequest) => {
    return authApi.post(
      `/api/v1/interview/question/cover-letter/save`,
      questionData
    );
  },

  // 문항 면접 시작 API - 카테고리를 인자로 받는 통합 방식
  selectCategory: (category: InterviewCategory) => {
    return authApi.post<StartQuestionInterviewResponse>(
      `/api/v1/interview/select/${category}`
    );
  },

  selectQuestionComplete: (
    category: InterviewCategory,
    selectData: InterviewVideoQuestionRequest
  ) => {
    return authApi.post(
      `/api/v1/interview/practice/question/${category}`,
      selectData
    );
  },

  selectCoverLetterQuestionComplete: (
    coverLetterId: number,
    questionIdList: number[]
  ) => {
    return authApi.post(`/api/v1/interview/practice/question/cover-letter`, {
      coverLetterId,
      questionIdList,
    });
  },

  // 미디어 저장 API - 통합 방식
  completeQuestion: (
    interviewAnswerId: number,
    videoFile: File,
    audioFile: File
  ) => {
    const formData = new FormData();

    // interviewAnswerId를 application/json 형식으로 설정
    const jsonBlob = new Blob([JSON.stringify(interviewAnswerId)], {
      type: "application/json",
    });
    formData.append("interviewAnswerId", jsonBlob);

    // 파일 필드는 그대로 추가
    formData.append("videoFile", videoFile);
    formData.append("audioFile", audioFile);

    return authApi.post("/api/v1/interview/practice/question", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 모의 면접 시작 API - 카테고리를 인자로 받는 통합 방식
  startInterview: (category: InterviewCategory, coverLetterId?: number) => {
    if (category === "cover-letter") {
      return authApi.post<StartInterviewResponse>(
        `/api/v1/interview/${category}`,
        { coverLetterId }
      );
    }
    return authApi.post<StartInterviewResponse>(
      `/api/v1/interview/${category}`
    );
  },

  completeInterview: (interviewVideoId: number, interviewTitle: string) => {
    return authApi.post(`/api/v1/interview/practice/end`, {
      interviewVideoId,
      interviewTitle,
    });
  },
  // 면접 조회 API 아직 response 미정
  //   getInterview: {
  //     list: () => {
  //       return authApi.get<Interview[]>("/api/v1/interview");
  //     },
  //     detail: (interviewId: number) => {
  //       return authApi.get<Interview>(`/api/v1/interview/${interviewId}`);
  //     },
  //     video: (interviewId: number, interviewVideoId: number) => {
  //       return authApi.get<InterviewVideo>(
  //         `/api/v1/interview/${interviewId}/${interviewVideoId}`
  //       );
  //     },
  //   },

  // 면접 영상 삭제 API
  deleteInterviewVideo: (interviewVideoId: number) => {
    return authApi.delete(`/api/v1/interview/${interviewVideoId}`);
  },

  // 질문 메모 API - 카테고리별 메모 처리
  memo: {
    // 메모 추가
    add: (category: InterviewCategory, memoInputData: QuestionMemoRequest) => {
      return authApi.post(
        `/api/v1/interview/question/${category}/memo`,
        memoInputData
      );
    },
    // 메모 수정
    update: (memoId: number, message: string) => {
      return authApi.patch(`/api/v1/interview/question/${memoId}`, message);
    },
    // 메모 삭제
    delete: (memoId: number) => {
      return authApi.delete(`/api/v1/interview/question/${memoId}`);
    },
  },

  // 자기소개서 질문에 메모 추가
  addCoverLetterMemo: (
    coverLetterId: number,
    memoData: QuestionMemoRequest
  ) => {
    return authApi.post(
      `/api/v1/interview/question/cover-letter/${coverLetterId}/memo`,
      { memoData }
    );
  },
};

export const interviewResultApi = {
  getInterviewList: () => {
    return authApi.get<InterviewResultListResponse>(`/api/v1/interview`);
  },
  getInterviewDetail: (interviewVideoId: number) => {
    return authApi.get<InterviewResultDetailResponse>(
      `/api/v1/interview/${interviewVideoId}`
    );
  },
  deleteInterviewResult: (interviewVideoId: number) => {
    return authApi.delete<DeleteInterviewResultResponse>(
      `/api/v1/interview/${interviewVideoId}`
    );
  },
};
