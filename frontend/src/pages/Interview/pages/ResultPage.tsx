import {
  useDeleteInterviewResult,
  useGetInterviewDetail,
} from "@/hooks/interviewResultHook";
import { Link, useParams } from "react-router";
import { useState } from "react";
import InterviewReview from "../components/InterviewReview";
import { Button } from "@/components/Button";
import Modal from "@/components/Modal";

function ResultPage() {
  const params = useParams();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: interviewDetail, isLoading } = useGetInterviewDetail(
    Number(params.id)
  );

  const { mutate: deleteInterview } = useDeleteInterviewResult(
    Number(params.id)
  );

  // 전체 면접 시간 계산
  const getTotalInterviewTime = () => {
    if (!interviewDetail?.interviewFeedbackList) return "00:00:00";

    let totalSeconds = 0;
    interviewDetail.interviewFeedbackList.forEach((question) => {
      if (question.interviewAnswerLength) {
        const timeParts = question.interviewAnswerLength.split(":");
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);
        totalSeconds += hours * 3600 + minutes * 60 + seconds;
      }
    });

    // 시:분:초 형식의 문자열로 변환
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // 형식: "00:01:30" (시:분:초)
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return timeString;
  };

  const handleTabClick = (index: number) => {
    setSelectedQuestionIndex(index);
  };
  const handleConfirmDelete = () => {
    deleteInterview();
    setIsDeleteModalOpen(false);
  };

  const selectedQuestion =
    interviewDetail?.interviewFeedbackList[selectedQuestionIndex];

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold">면접 결과</h2>
      </div>

      {isLoading ? (
        <div>면접 불러오는 중...</div>
      ) : interviewDetail ? (
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm rounded-t-sm border-t-4 border-t-primary">
              <h3 className="mb-4 text-xl font-medium">기본 정보</h3>

              <div className="w-full space-y-4">
                <div>
                  <p className="text-base text-gray-500">면접 제목</p>
                  <p className="text-lg font-medium">
                    {interviewDetail.interviewTitle}
                  </p>
                </div>
                <div>
                  <p className="text-base text-gray-500">날짜</p>
                  <p className="text-lg font-medium">{interviewDetail.date}</p>
                </div>
                <div>
                  <p className="text-base text-gray-500 mb-2">
                    면접 결과 삭제하기
                  </p>
                  <Button
                    className="hover:bg-red-600 hover:text-white hover:border-red-600 active:bg-red-700 active:text-white active:border-red-700"
                    variant="white"
                    onClick={handleDeleteClick}
                  >
                    결과 삭제
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm rounded-t-sm border-t-4 border-t-primary">
              <h3 className="mb-4 text-xl font-medium">면접 개요</h3>
              <div className="mb-4 flex flex-col space-y-4">
                <div>
                  <p className="text-base text-gray-500">면접 카테고리</p>
                  <p className="text-lg font-medium">
                    {interviewDetail.interviewCategory}
                  </p>
                </div>
                <div>
                  <p className="text-base text-gray-500">질문 카테고리</p>
                  <p className="text-lg font-medium">
                    {interviewDetail.interviewQuestionCategory}
                  </p>
                </div>
                <div>
                  <p className="text-base text-gray-500">질문 수</p>
                  <p className="text-lg font-medium">
                    {interviewDetail.interviewFeedbackList.length}개
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm rounded-t-sm border-t-4 border-t-primary">
              <h3 className="mb-4 text-xl font-medium">면접 시간</h3>
              <div className="mb-2 text-2xl font-bold">
                {getTotalInterviewTime()}
              </div>
              <div className="flex items-center mb-4">
                <h3 className="text-lg font-medium">문항당 답변 시간</h3>
                <span className="ml-2 text-sm text-gray-500">
                  (적정 시간: 답변 당 2-3분)
                </span>
              </div>
              <div className="space-y-2">
                {interviewDetail.interviewFeedbackList.map(
                  (question, index) => (
                    <div
                      key={question.interviewAnswerId}
                      className="flex gap-2"
                    >
                      <span className="text-sm">{index + 1}번 문항:</span>
                      <span className="font-medium">
                        {question.interviewAnswer
                          ? question.interviewAnswerLength
                          : "00:00:00"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mb-6 border-b">
            <div className="flex space-x-6">
              {interviewDetail.interviewFeedbackList.map((question, index) => (
                <button
                  key={question.interviewAnswerId}
                  onClick={() => handleTabClick(index)}
                  className={`px-4 py-2 font-medium ${
                    selectedQuestionIndex === index
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {index + 1}번 문항
                </button>
              ))}
              <button
                onClick={() => setSelectedQuestionIndex(-1)}
                className={`px-4 py-2 font-medium ${
                  selectedQuestionIndex === -1
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                총평
              </button>
            </div>
          </div>

          {selectedQuestionIndex === -1 ? (
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-accent">면접 총평</h3>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {interviewDetail.interviewFeedback}
                </p>
              </div>
            </div>
          ) : selectedQuestion ? (
            <InterviewReview selectedQuestion={selectedQuestion} />
          ) : (
            <div>면접 결과를 찾을 수 없습니다.</div>
          )}
          <div className="flex justify-end">
            <Button variant="default">
              <Link to="/" className="text-base">
                모의 면접 목록
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <div>면접 결과를 찾을 수 없습니다.</div>
      )}

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="면접 결과 삭제"
        warning={true}
      >
        <p>정말 삭제하시겠습니까?</p>
      </Modal>
    </>
  );
}
export default ResultPage;
