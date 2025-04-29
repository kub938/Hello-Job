import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div id="wrap" className="bg-background min-h-screen flex flex-col">
      <Outlet />
      <Toaster />
    </div>
  );
}

export default App;
