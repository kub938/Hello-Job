import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div id="wrap">
      <header className="max-w-screen-xl mx-auto border">
        안녕하세요? 헤더입니다.
      </header>
      <main className="max-w-screen-xl mx-auto border">
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
}

export default App;
