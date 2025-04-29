import { Outlet } from "react-router";
import Header from "../Header";

function DefaultLayout() {
  return (
    <>
      <Header />
      <main className="grow max-w-screen-xl mx-auto w-full">
        <Outlet />
      </main>
    </>
  );
}

export default DefaultLayout;
