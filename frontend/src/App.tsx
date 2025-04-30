import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export default App;
