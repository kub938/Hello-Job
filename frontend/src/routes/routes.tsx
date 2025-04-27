import { createBrowserRouter } from "react-router";
import App from "@/App";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login/Login";
import CorporateSearch from "@/pages/CorporateSearch/CorporateSearch";
import Mypage from "@/pages/Mypage/Mypage";
import JobSearch from "@/pages/JobSearch/JobSearch";

const router = createBrowserRouter([
  {
    // 모든 라우터들의 컨테이너 개념. home router도 이 하위에 작성한다다
    path: "/",
    element: <App />,
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
]);

export default router;
