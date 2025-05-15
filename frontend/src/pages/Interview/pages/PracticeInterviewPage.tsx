import { Pause, Plus, X, HelpCircle } from "lucide-react";
import { Link } from "react-router";
import Interviewer from "../../../assets/interview/Interviewer.webp";
function PracticeInterviewPage() {
  return (
    <div className="relative h-[86vh] w-full">
      {/* 현재 질문 표시 (좌측 상단) */}
      <div className="absolute left-4 top-4 z-10 flex items-center">
        <div className="h-6 w-2 rounded-sm bg-primary"></div>
        <div className="ml-2 text-sm font-medium">
          현재 질문: 본인의 강점과 약점에 대해 말씀해 주세요.
        </div>
      </div>

      {/* 면접 화면 영역 */}
      <div className=" h-full w-full">
        {/* 메인 면접관 이미지 */}
        <img src={Interviewer} className="h-full" alt="면접관" />

        {/* 내 화면 (오른쪽 하단) */}
        <div className="absolute bottom-4 right-4 h-48 w-64 overflow-hidden rounded-lg border-4 border-white bg-gray-900 shadow-lg">
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <p className="text-sm text-gray-400">내 화면</p>
            </div>
          </div>
        </div>

        {/* 컨트롤 버튼 (중앙 하단) */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Plus className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Pause className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
            <X className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 완료 버튼 (우측 하단) */}
      <Link
        to="/interview/result"
        className="absolute bottom-20 right-4 rounded-md bg-primary px-6 py-2 text-white hover:bg-accent"
      >
        완료
      </Link>
    </div>
  );
}

export default PracticeInterviewPage;
