import { useGetInterviewResult } from "@/hooks/interviewResultHook";
import MypageHeader from "./MypageHeader";
import { useNavigate } from "react-router";
import { FaTag } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import { timeParser } from "@/hooks/timeParser";

function InterviewVideos() {
  const { data, isLoading } = useGetInterviewResult();
  const navigate = useNavigate();

  const handleInterviewClick = (interviewVideoId: number) => {
    navigate(`/interview/result/${interviewVideoId}`);
  };

  return (
    <div className="flex-1 p-4 md:p-6 md:ml-58 transition-all duration-300">
      <MypageHeader title="면접 결과" />
      {isLoading ? (
        <div className="text-center py-6">로딩 중...</div>
      ) : data?.length && data?.length > 0 ? (
        <div className="grid gap-4 mt-4">
          {data?.map((interview) => (
            <div
              key={interview.interviewVideoId}
              className="border-l-4 border-[#6F4BFF] bg-white rounded-lg rounded-l-xs p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleInterviewClick(interview.interviewVideoId)}
            >
              <div className="text-lg font-bold text-[#333] mb-2 block hover:text-[#6F4BFF] transition-colors">
                {interview.interviewTitle}
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">첫 질문:</span>{" "}
                  {interview.firstQuestion}
                </div>
                {interview.selectQuestion && (
                  <div className="text-sm text-gray-600 w-full truncate">
                    <span className="font-medium">선택 질문:</span>{" "}
                    {interview.selectQuestion}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FaRegCalendarAlt className="text-gray-400" />
                    {timeParser ? timeParser(interview.start) : interview.start}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#edeafb] text-[#6F4BFF] text-sm px-2 py-0.5 rounded-full flex items-center">
                    <FaTag className="mr-1 text-xs" />{" "}
                    {interview.interviewCategory}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">면접 결과가 없습니다.</div>
      )}
    </div>
  );
}

export default InterviewVideos;
