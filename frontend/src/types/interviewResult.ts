type InterviewCategory = "CS" | "PERSONALITY" | "COVERLETTER";

export interface InterviewResult {
  interviewVideoId: number;
  feedbackEnd: boolean;
  interviewCategory: InterviewCategory; // CS, PERSONALITY, COVERLETTER
  selectQuestion: boolean; // true면 문항 선택 면접, false면 모의 면접
  interviewTitle: string;
  start: string; // 생성 날짜
  firstQuestion: string; // 첫 번째 문항
}

export interface InterviewQuestion {
  interviewAnswerId: number;
  interviewVideoUrl: string;
  videoLength: string;
  interviewQuestion: string;
  interviewQuestionCategory: InterviewCategory; // 네트워크, 운영체제, 컴퓨터구조, 등등... null 가능성 있음. 필요 없는 데이터면 백한테 말해줘요
}

export interface InterviewFeedback {
  interviewAnswerId: number;
  interviewQuestion: string;
  interviewAnswer: string;
  interviewAnswerFeedback: string;
  interviewAnswerFollowUpQuestion: string[];
  interviewAnswerVideoUrl: string;
  interviewAnswerLength: string;
}
export interface InterviewResultDetailResponse {
  interviewVideoId: number;
  interviewFeedback: string;
  interviewTitle: string;
  date: string;
  interviewQuestionCategory: string;
  interviewCategory: string;
  interviewFeedbackList: InterviewFeedback[];
}
export interface DeleteInterviewResultResponse {
  message: string;
}
