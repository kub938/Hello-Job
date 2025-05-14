import { createBrowserRouter } from "react-router";
import { lazy, ReactNode, Suspense } from "react";

import App from "@/App";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import CorporateSearch from "@/pages/CorporateSearch/CorporateSearch";
import Mypage from "@/pages/Mypage/Mypage";
import JobResearch from "@/pages/JobResearch/JobResearch";
import Loading from "@/components/Loading/Loading";
import RouterErrorHandler from "@/components/Error/RouterErrorHandler";
import RenderErrorFallback from "@/components/Error/RenderErrorHandler";
import { ErrorBoundary } from "react-error-boundary";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import BlankLayout from "@/components/layouts/BlankLayout";
import CoverLetter from "@/pages/CoverLetter/CoverLetter";

// 마이페이지 서브 컴포넌트들
import Schedule from "@/pages/Mypage/components/Schedule";
import BookmarkedCompanies from "@/pages/Mypage/components/BookmarkedCompanies";
import BookmarkedJobs from "@/pages/Mypage/components/BookmarkedJobs";
import InterviewVideos from "@/pages/Mypage/components/InterviewVideos";
import Account from "@/pages/Mypage/components/Account";
import CoverLetterList from "@/pages/Mypage/components/CoverLetterList";
import CorporateResearch from "@/pages/CorporateResearch/CorporateResearch";
import MyExperience from "@/pages/Mypage/components/MyExperience/MyExperience";
import MyProject from "@/pages/Mypage/components/MyProject/MyProject";
import StandardLayout from "@/components/layouts/StandardLayout";
import TypeSelectPage from "@/pages/Interview/pages/TypeSelectPage";
import InterviewPage from "@/pages/Interview/pages/InterviewLayoutPage";
import ResultPage from "@/pages/Interview/pages/ResultPage";
import PreparePage from "@/pages/Interview/pages/PreparePage";
import SelectQuestionPage from "@/pages/Interview/pages/SelectQuestionPage";
import PracticeInterviewPage from "@/pages/Interview/pages/PracticeInterviewPage";
import { categoryValidator } from "@/pages/Interview/util/validRouteCategory";
import InterviewTest from "@/pages/Interview/pages/InterviewTest";
import MyCompanies from "@/pages/Mypage/components/MyCompanies";
import MyJobs from "@/pages/Mypage/components/MyJobs";

const CoverLetterAnalysis = lazy(
  () => import("@/pages/CoverLetterAnalysis/CoverLetterAnalysis")
);

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
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
            element: (
              <SuspenseWrapper>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <CoverLetter />,
                </ErrorBoundary>
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        element: <DefaultLayout />,
        children: [
          {
            path: "cover-letter",
            element: (
              <SuspenseWrapper>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <CoverLetterAnalysis />
                </ErrorBoundary>
              </SuspenseWrapper>
            ),
            children: [
              {
                path: "select-job",
              },
              {
                path: "select-company",
              },
              {
                path: "input-question",
              },
            ],
          },

          {
            path: "corporate-search",
            element: <CorporateSearch />,
          },
          {
            path: "job-research/:id",
            element: (
              <SuspenseWrapper>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <JobResearch />
                </ErrorBoundary>
              </SuspenseWrapper>
            ),
          },
          {
            path: "corporate-research/:id",
            element: (
              <SuspenseWrapper>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <CorporateResearch />
                </ErrorBoundary>
              </SuspenseWrapper>
            ),
          },
          {
            path: "interview",
            element: (
              <SuspenseWrapper>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <InterviewPage />
                </ErrorBoundary>
              </SuspenseWrapper>
            ),
            children: [
              {
                path: "result",
                element: (
                  <SuspenseWrapper>
                    <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                      <ResultPage />
                    </ErrorBoundary>
                  </SuspenseWrapper>
                ),
              },
              {
                path: "prepare",
                element: (
                  <SuspenseWrapper>
                    <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                      <PreparePage />
                    </ErrorBoundary>
                  </SuspenseWrapper>
                ),
              },
              {
                path: "test",
                element: (
                  <SuspenseWrapper>
                    <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                      <InterviewTest />
                    </ErrorBoundary>
                  </SuspenseWrapper>
                ),
              },
              {
                path: "select",
                element: (
                  <SuspenseWrapper>
                    <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                      <TypeSelectPage />
                    </ErrorBoundary>
                  </SuspenseWrapper>
                ),
              },
              {
                path: ":category",
                element: (
                  <SuspenseWrapper>
                    <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                      <SelectQuestionPage />
                    </ErrorBoundary>
                  </SuspenseWrapper>
                ),
                loader: categoryValidator,
              },
              {
                path: "practice-interview",
                element: (
                  <SuspenseWrapper>
                    <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                      <PracticeInterviewPage />
                    </ErrorBoundary>
                  </SuspenseWrapper>
                ),
              },
              {},
            ],
          },
        ],
      },
      {
        // 헤더가 없는 레이아웃
        element: <BlankLayout />,
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
            path: "mypage",
            element: <Mypage />,
            children: [
              {
                path: "",
                element: <Schedule />,
              },
              {
                path: "schedule",
                element: <Schedule />,
              },
              {
                path: "cover-letter-list",
                element: <CoverLetterList />,
              },
              {
                path: "bookmarks/companies",
                element: <BookmarkedCompanies />,
              },
              {
                path: "bookmarks/jobs",
                element: <BookmarkedJobs />,
              },
              {
                path: "interviews-videos",
                element: <InterviewVideos />,
              },
              {
                path: "account",
                element: <Account />,
              },
              {
                path: "my-companies",
                element: <MyCompanies />,
              },
              {
                path: "my-jobs",
                element: <MyJobs />,
              },
              {
                path: "my-experience",
                element: <MyExperience />,
              },
              {
                path: "my-project",
                element: <MyProject />,
              },
            ],
          },
          // 헤더가 없는 다른 페이지들을 여기에 추가할 수 있습니다
        ],
      },
    ],
  },
]);

export default router;
