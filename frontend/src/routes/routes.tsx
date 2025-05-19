import { ComponentType, lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import Loading from "@/components/Loading/Loading";
import RouterErrorHandler from "@/components/Error/RouterErrorHandler";
import RenderErrorFallback from "@/components/Error/RenderErrorHandler";
import { ErrorBoundary } from "react-error-boundary";

import App from "@/App";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import BlankLayout from "@/components/layouts/BlankLayout";
import StandardLayout from "@/components/layouts/StandardLayout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";

const CoverLetter = lazy(() => import("@/pages/CoverLetter/CoverLetter"));
const CoverLetterAnalysis = lazy(
  () => import("@/pages/CoverLetterAnalysis/CoverLetterAnalysis")
);
const JobResearch = lazy(() => import("@/pages/JobResearch/JobResearch"));
const CorporateSearch = lazy(
  () => import("@/pages/CorporateSearch/CorporateSearch")
);
const CorporateResearch = lazy(
  () => import("@/pages/CorporateResearch/CorporateResearch")
);
const Mypage = lazy(() => import("@/pages/Mypage/Mypage"));
const InterviewPage = lazy(
  () => import("@/pages/Interview/pages/InterviewLayoutPage")
);

const MyExperience = lazy(
  () => import("@/pages/Mypage/components/MyExperience/MyExperience")
);
const MyProject = lazy(
  () => import("@/pages/Mypage/components/MyProject/MyProject")
);

import Schedule from "@/pages/Mypage/components/ScheduleManager";
import BookmarkedCompanies from "@/pages/Mypage/components/BookmarkedCompanies";
import BookmarkedJobs from "@/pages/Mypage/components/BookmarkedJobs";
import InterviewVideos from "@/pages/Mypage/components/InterviewVideos";
import Account from "@/pages/Mypage/components/Account";
import CoverLetterList from "@/pages/Mypage/components/CoverLetterList";
import MyCompanies from "@/pages/Mypage/components/MyCompanies";
import MyJobs from "@/pages/Mypage/components/MyJobs";
import MyInterviewList from "@/pages/Mypage/components/MyInterviewList";
import MyInterviewDetail from "@/pages/Mypage/components/MyInterviewDetail";

import ResultPage from "@/pages/Interview/pages/ResultPage";
import ResultList from "@/pages/Interview/pages/ResultList";
import PreparePage from "@/pages/Interview/pages/PreparePage";
import TypeSelectPage from "@/pages/Interview/pages/TypeSelectPage";
import CoverLetterQuestionPage from "@/pages/Interview/pages/CoverLetterQuestionPage";
import SelectQuestionPage from "@/pages/Interview/pages/SelectQuestionPage";
import PracticeInterviewPage from "@/pages/Interview/pages/PracticeInterviewPage";
import { categoryValidator } from "@/pages/Interview/util/validRouteCategory";

interface LazyComponentProps {
  component: ComponentType<any>;
}
function LazyComponent({ component: Component }: LazyComponentProps) {
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary FallbackComponent={RenderErrorFallback}>
        <Component />
      </ErrorBoundary>
    </Suspense>
  );
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
            element: <LazyComponent component={CoverLetter} />,
          },
        ],
      },
      {
        element: <DefaultLayout />,
        children: [
          {
            path: "cover-letter",
            element: <LazyComponent component={CoverLetterAnalysis} />,
            children: [
              { path: "select-job" },
              { path: "select-company" },
              { path: "input-question" },
            ],
          },
          {
            path: "corporate-search",
            element: <LazyComponent component={CorporateSearch} />,
          },
          {
            path: "job-research/:id",
            element: <LazyComponent component={JobResearch} />,
          },
          {
            path: "corporate-research/:id",
            element: <LazyComponent component={CorporateResearch} />,
          },
          {
            path: "interview",
            element: <LazyComponent component={InterviewPage} />,
            children: [
              {
                path: "result",
                element: <ResultPage />,
              },
              {
                path: "result-list",
                element: <ResultList />,
              },
              {
                path: "prepare",
                element: <PreparePage />,
              },
              {
                path: "select",
                element: <TypeSelectPage />,
              },
              {
                path: "cover-letter",
                element: <CoverLetterQuestionPage />,
              },
              {
                path: ":category",
                element: <SelectQuestionPage />,
                loader: categoryValidator,
              },
              {
                path: "practice",
                element: <PracticeInterviewPage />,
              },
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
            element: <LazyComponent component={Home} />,
          },
          {
            path: "login",
            element: <LazyComponent component={Login} />,
          },
          {
            path: "mypage",
            element: <LazyComponent component={Mypage} />,
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
                element: <LazyComponent component={MyExperience} />,
              },
              {
                path: "my-project",
                element: <LazyComponent component={MyProject} />,
              },
              {
                path: "interview-list",
                element: <MyInterviewList />,
              },
              {
                path: "interview-detail",
                element: <MyInterviewDetail />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
