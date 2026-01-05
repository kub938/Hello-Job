import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./routes/routes.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading/Loading.tsx";
import RouterErrorHandler from "./components/Error/RouterErrorHandler.tsx";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const { worker } = await import("./mocks/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and running.
  return worker.start();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      throwOnError: true,
    },
  },
});

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary FallbackComponent={RouterErrorHandler}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loading />}>
          <RouterProvider router={router} />
        </Suspense>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
});
