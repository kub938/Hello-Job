import { Outlet } from "react-router";
import Header from "../Common/Header";

function StandardLayout() {
  return (
    <>
      <Header />
      <main className="grow mx-auto w-full">
        <Outlet />
      </main>
    </>
  );
}

export default StandardLayout;
