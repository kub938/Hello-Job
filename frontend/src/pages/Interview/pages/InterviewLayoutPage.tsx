import { Outlet } from "react-router";

function InterviewLayoutPage() {
  return (
    <div className="w-full h-full my-5">
      <Outlet />
    </div>
  );
}

export default InterviewLayoutPage;
