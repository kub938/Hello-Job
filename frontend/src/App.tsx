import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import Header from "./components/Common/Header";

function App() {
  return (
    <div id="wrap" className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow max-w-screen-xl mx-auto w-full">
        <Outlet />
        <Toaster />
      </main>
    </div>
  );
}

export default App;
