import { InterviewFeedback } from "@/types/interviewResult";

interface InterviewReviewProps {
  selectedQuestion: InterviewFeedback;
}

function InterviewReview({ selectedQuestion }: InterviewReviewProps) {
  return (
    <>
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-accent">질문 & 답변</h3>
        </div>
        <div className="rounded-lg bg-white p-4">
          <div className="flex flex-col items-start gap-3 text-lg font-medium">
            <div>Q. {selectedQuestion.interviewQuestion}</div>
          </div>
        </div>
        <div className="mb-4 rounded-lg bg-secondary-light p-4">
          <div className="flex flex-col items-start gap-3 text-lg font-medium">
            <div>A. {selectedQuestion.interviewAnswer}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-full">
            <div className="mt-4">
              {selectedQuestion.interviewAnswerVideoUrl && (
                <div className="mt-2 w-full flex flex-col items-center justify-center">
                  <video
                    src={selectedQuestion.interviewAnswerVideoUrl}
                    controls
                    className="mt-2 rounded w-full max-w-2xl"
                  />
                  <p className="text-base text-gray-500 mt-4">
                    답변 시간:{" "}
                    <span className="font-medium">
                      {selectedQuestion.interviewAnswerLength}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-accent">AI 피드백</h3>
        </div>
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
            {selectedQuestion.interviewAnswerFeedback}
          </p>
        </div>
      </div>

      {selectedQuestion.interviewAnswerFollowUpQuestion && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-accent">꼬리 질문</h3>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <ul className="list-disc pl-5 text-lg text-gray-700 space-y-3">
              {Array.isArray(
                selectedQuestion.interviewAnswerFollowUpQuestion
              ) ? (
                selectedQuestion.interviewAnswerFollowUpQuestion.map((q, i) => (
                  <li key={i} className="leading-relaxed">
                    {q}
                  </li>
                ))
              ) : (
                <li className="leading-relaxed">
                  {selectedQuestion.interviewAnswerFollowUpQuestion}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default InterviewReview;
