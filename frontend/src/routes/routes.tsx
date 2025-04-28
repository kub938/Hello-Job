import { createBrowserRouter } from "react-router";
import { lazy, ReactNode, Suspense } from "react";

import App from "@/App";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import Loading from "@/components/Loading/Loading";
import RouterErrorHandler from "@/components/Error/RouterErrorHandler";
import RenderErrorFallback from "@/components/Error/RenderErrorHandler";
import { ErrorBoundary } from "react-error-boundary";

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
        path: "",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
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
    ],
  },
]);

export default router;
