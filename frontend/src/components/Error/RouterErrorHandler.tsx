import { useRouteError, isRouteErrorResponse, Link } from "react-router";

const RouterErrorHandler = () => {
  const error = useRouteError();

  // React Router의 에러 응답인지 확인
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="flex flex-col h-screen items-center justify-center">
          <h1 className="font-bold text-4xl mb-10">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mb-8">
            요청하신 URL에 해당하는 페이지가 존재하지 않습니다.
          </p>
          <Link
            to="/"
            className="text-lg bg-primary py-3 px-5 rounded shadow text-white"
          >
            홈으로 돌아가기
          </Link>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="flex flex-col h-screen items-center justify-center">
          <h1 className="font-bold text-4xl mb-10">접근 권한이 없습니다</h1>
          <p className="mb-8">이 페이지에 접근하려면 로그인이 필요합니다.</p>
          <div className="mt-4">
            <Link
              to="/login"
              className="text-lg bg-primary py-3 px-5 rounded shadow text-white"
            >
              로그인 하기
            </Link>
          </div>
        </div>
      );
    }

    if (error.status === 403) {
      return (
        <div className="flex flex-col h-screen items-center justify-center">
          <h1 className="font-bold text-4xl mb-10">접근 권한이 없습니다</h1>
          <p className="mb-8">이 페이지에 접근할 권한이 없습니다.</p>
          <div className="mt-4">
            <Link
              to="/"
              className="text-lg bg-primary py-3 px-5 rounded shadow text-white"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      );
    }

    // 기타 에러
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <h1 className="font-bold text-4xl mb-10">
          오류가 발생했습니다 ({error.status})
        </h1>
        <p className="mb-8">
          {error.statusText || "알 수 없는 오류가 발생했습니다."}
        </p>
        <div className="mt-4">
          <Link
            to="/"
            className="text-lg bg-primary py-3 px-5 rounded shadow text-white"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="font-bold text-4xl mb-10">
        예상치 못한 오류가 발생했습니다
      </h1>
      <p className="mb-8">
        {error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다. 나중에 다시 시도해 주세요."}
      </p>
      <div className="flex gap-4 mt-4">
        <Link
          to="/"
          className="text-lg bg-primary py-3 px-5 rounded shadow text-white"
        >
          홈으로 돌아가기
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="text-lg bg-gray-500 py-3 px-5 rounded shadow text-white"
        >
          새로고침
        </button>
      </div>
    </div>
  );
};

export default RouterErrorHandler;
