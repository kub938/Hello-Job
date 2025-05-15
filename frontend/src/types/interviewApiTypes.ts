export type InterviewCategory = null | "cover-letter" | "cs" | "personality";

export interface QuestionResponse {
  questionBankId: number;
  question: string;
}

export interface StartQuestionInterviewResponse {
  interviewId: number;
  interviewVideoId: number;
}

export interface InterviewVideoQuestionRequest {
  interviewVideoId: number;
  questionIdList: number[];
}

export interface InterviewAnswerInfo {
  interviewAnswerId: number;
}

export interface QuestionList {
  questionBankId: number;
  interviewAnswerId: number;
  question: string;
}
export interface StartInterviewResponse {
  interviewId: number;
  interviewVideoId: number;
  questionList: QuestionList[];
}

export interface QuestionMemoRequest {
  questionBankId: number;
  interviewId: number;
  memo: string;
}

export interface SaveQuestionRequest {
  coverLetterId: number;
  coverLetterQuestion: string[];
}

export interface CreateQuestionResponse {
  coverLetterId: number;
  coverLetterQuestion: string[];
}
