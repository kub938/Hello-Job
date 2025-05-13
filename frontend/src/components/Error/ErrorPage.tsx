import { ErrorPageProps } from "@/types/errorTypes";
import { useNavigate } from "react-router";

function ErrorPage({
  status,
  title,
  message,
  actionButton,
  showHomeButton = true,
  showBackButton = true,
}: ErrorPageProps) {
  const navigate = useNavigate();

  // 403 오류인 경우 기본 메시지 설정
  const displayTitle =
    status === 403 ? "로그인이 필요합니다" : title || "오류가 발생했습니다";
  const displayMessage =
    status === 403 ? "이 서비스를 이용하려면 로그인이 필요합니다." : message;

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-52px)] p-6 bg-gray-50">
      {/* 상태 및 브랜드 */}
      <div className="mb-8">
        {status && (
          <div className="text-6xl font-bold text-center text-primary mb-6">
            {status}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800">{displayTitle}</h1>
      </div>

      {/* 메시지 */}
      {displayMessage && (
        <p className="text-center text-gray-600 max-w-md mb-8">
          {displayMessage}
        </p>
      )}

      {/* 사용자 행동 버튼 */}
      <div className="flex flex-wrap gap-4 justify-center">
        {status === 403 ? (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-6 py-2 rounded-md font-medium"
          >
            로그인하기
          </button>
        ) : (
          actionButton && (
            <button
              onClick={actionButton.onClick}
              className="bg-primary text-white px-6 py-2 rounded-md font-medium"
            >
              {actionButton.label}
            </button>
          )
        )}

        {showHomeButton && (
          <button
            onClick={() => navigate("/")}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium"
          >
            홈으로 돌아가기
          </button>
        )}

        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium"
          >
            이전 페이지로
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorPage;
