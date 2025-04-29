import { createBrowserRouter } from "react-router";
import { lazy, ReactNode, Suspense } from "react";

import App from "@/App";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import CorporateSearch from "@/pages/CorporateSearch/CorporateSearch";
import Mypage from "@/pages/Mypage/Mypage";
import JobSearch from "@/pages/JobSearch/JobSearch";
import Loading from "@/components/Loading/Loading";
import RouterErrorHandler from "@/components/Error/RouterErrorHandler";
import RenderErrorFallback from "@/components/Error/RenderErrorHandler";
import { ErrorBoundary } from "react-error-boundary";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import BlankLayout from "@/components/layouts/BlankLayout";

const CoverLetter = lazy(() => import("@/pages/CoverLetter/CoverLetter"));

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    // 모든 라우터들의 컨테이너 개념. home router도 이 하위에 작성한다다
    path: "/",
    element: <App />,
    errorElement: <RouterErrorHandler />,
    children: [
      {
        // 헤더가 있는 레이아웃
        element: <DefaultLayout />,
        children: [
          {
            path: "",
            element: <Home />,
          },
          {
            path: "cover-letter",
            element: (
              <SuspenseWrapper>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <CoverLetter />
                </ErrorBoundary>
              </SuspenseWrapper>
            ),
          },
          {
            path: "corporate-search",
            element: <CorporateSearch />,
          },
          {
            path: "mypage",
            element: <Mypage />,
          },
          {
            path: "job-search",
            element: <JobSearch />,
          },
        ],
      },
      {
        // 헤더가 없는 레이아웃
        element: <BlankLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          // 헤더가 없는 다른 페이지들을 여기에 추가할 수 있습니다
        ],
      },
    ],
  },
]);

export default router;
