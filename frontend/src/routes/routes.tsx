import { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { ErrorBoundary } from "react-error-boundary";
import RouterErrorHandler from "@/components/Error/RouterErrorHandler";
import Loading from "@/components/Loading/Loading";
import RenderErrorFallback from "@/components/Error/RenderErrorHandler";
// 공통/핵심 컴포넌트는 정적 import 유지
import App from "@/App";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import BlankLayout from "@/components/layouts/BlankLayout";
import StandardLayout from "@/components/layouts/StandardLayout";

// Suspense + ErrorBoundary 래퍼
function LazyWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary FallbackComponent={RenderErrorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
}

// Lazy route 헬퍼
function createLazyRoute(
  importFn: () => Promise<{ default: React.ComponentType }>
) {
  return async () => {
    const { default: Component } = await importFn();
    return {
      Component: () => (
        <LazyWrapper>
          <Component />
        </LazyWrapper>
      ),
    };
  };
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouterErrorHandler />,
    children: [
      {
        element: <StandardLayout />,
        children: [
          {
            path: "cover-letter/:id",
            lazy: createLazyRoute(
              () => import("@/pages/CoverLetter/CoverLetter")
            ),
          },
        ],
      },
      {
        element: <DefaultLayout />,
        children: [
          {
            path: "cover-letter",
            lazy: createLazyRoute(
              () => import("@/pages/CoverLetterAnalysis/CoverLetterAnalysis")
            ),
            children: [
              { path: "select-job" },
              { path: "select-company" },
              { path: "input-question" },
            ],
          },
          {
            path: "corporate-search",
            lazy: createLazyRoute(
              () => import("@/pages/CorporateSearch/CorporateSearch")
            ),
          },
          {
            path: "job-research/:id",
            lazy: createLazyRoute(
              () => import("@/pages/JobResearch/JobResearch")
            ),
          },
          {
            path: "corporate-research/:id",
            lazy: createLazyRoute(
              () => import("@/pages/CorporateResearch/CorporateResearch")
            ),
          },
          {
            path: "interview",
            lazy: createLazyRoute(
              () => import("@/pages/Interview/pages/InterviewLayoutPage")
            ),
            children: [
              {
                path: "result/:id",
                lazy: createLazyRoute(
                  () => import("@/pages/Interview/pages/ResultPage")
                ),
              },
              {
                path: "prepare",
                lazy: createLazyRoute(
                  () => import("@/pages/Interview/pages/PreparePage")
                ),
              },
              {
                path: "select",
                lazy: createLazyRoute(
                  () => import("@/pages/Interview/pages/TypeSelectPage")
                ),
              },
              {
                path: "cover-letter",
                lazy: createLazyRoute(
                  () =>
                    import("@/pages/Interview/pages/CoverLetterQuestionPage")
                ),
              },
              {
                path: ":category",
                lazy: createLazyRoute(
                  () => import("@/pages/Interview/pages/SelectQuestionPage")
                ),
                loader: async (args) =>
                  (
                    await import("@/pages/Interview/util/validRouteCategory")
                  ).categoryValidator(args),
              },
              {
                path: "practice",
                lazy: createLazyRoute(
                  () => import("@/pages/Interview/pages/PracticeInterviewPage")
                ),
              },
            ],
          },
        ],
      },
      {
        element: <BlankLayout />,
        children: [
          {
            path: "",
            lazy: createLazyRoute(() => import("@/pages/Home/Home")),
          },
          {
            path: "login",
            lazy: createLazyRoute(() => import("@/pages/Login/Login")),
          },
          {
            path: "mypage",
            lazy: createLazyRoute(() => import("@/pages/Mypage/Mypage")),
            children: [
              {
                path: "",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/ScheduleManager")
                ),
              },
              {
                path: "schedule",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/ScheduleManager")
                ),
              },
              {
                path: "cover-letter-list",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/CoverLetterList")
                ),
              },
              {
                path: "bookmarks/companies",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/BookmarkedCompanies")
                ),
              },
              {
                path: "bookmarks/jobs",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/BookmarkedJobs")
                ),
              },
              {
                path: "interviews-videos",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/InterviewVideos")
                ),
              },
              {
                path: "account",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/Account")
                ),
              },
              {
                path: "my-companies",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/MyCompanies")
                ),
              },
              {
                path: "my-jobs",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/MyJobs")
                ),
              },
              {
                path: "my-experience",
                lazy: createLazyRoute(
                  () =>
                    import(
                      "@/pages/Mypage/components/MyExperience/MyExperience"
                    )
                ),
              },
              {
                path: "my-project",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/MyProject/MyProject")
                ),
              },
              {
                path: "interview-detail",
                lazy: createLazyRoute(
                  () => import("@/pages/Mypage/components/MyInterviewDetail")
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
