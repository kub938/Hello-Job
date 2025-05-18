import { Button } from "@/components/Button";
import Loading from "@/components/Loading/Loading";
import { useCompleteInterview } from "@/hooks/interviewHooks";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface InterviewCompleteModalProps {
  interviewVideoId: number;
}
function InterviewCompleteModal({
  interviewVideoId,
}: InterviewCompleteModalProps) {
  const completeInterviewMutation = useCompleteInterview();

  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const handleCompleteInterview = () => {
    completeInterviewMutation.mutate(
      {
        interviewVideoId: interviewVideoId,
        interviewTitle: title,
      },
      {
        onSuccess: () => {
          toast.info("저장에 성공했습니다.");
          navigate("/interview/result");
        },
      }
    );
  };
  return (
    <div className="modal-overlay bg-black/90">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
        {completeInterviewMutation.isPending ? (
          <>
            <Loading></Loading>
            <p className="text-sm mt-4 text-center">
              AI가 피드백을 생성하는 중이에요! 잠시만 기다려 주세요!
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-medium mb-2">인터뷰 제목 입력</h2>
            <p className="text-gray-600 pb-3 ">
              완료된 인터뷰의 제목을 입력해주세요.
            </p>

            <input
              type="text"
              placeholder="인터뷰 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mb-4 mt-1 text-gray-500 text-sm ml-1">
              제목을 입력해 주셔야 AI 피드백을 받으실 수 있습니다!
            </p>

            <div className="flex justify-end space-x-3">
              <Button className="w-20 h-10" onClick={handleCompleteInterview}>
                완료
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InterviewCompleteModal;
