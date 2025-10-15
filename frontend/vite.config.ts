import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import removeConsole from "vite-plugin-remove-console";
import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Option+Shift+Click 으로 컴포넌트 소스 바로 열기
    removeConsole({
      external: ["src/pages/Home/Home.tsx"],
    }),
    visualizer({
      //번들 시각화를 위함
      open: true, // 빌드 후 자동으로 시각화 파일 열기
      filename: "stats.html", // 출력 파일명
      gzipSize: true, // gzip 크기 표시
      brotliSize: true, // brotli 크기 표시
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://k12b105.p.ssafy.io",
        secure: true,
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("proxyReq", function (proxyReq, req) {
            proxyReq.setHeader("Cookie", req.headers.cookie || "");
          });
        },
        cookieDomainRewrite: "localhost",
        cookiePathRewrite: "/",
      },
    },
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: "dist",
    modulePreload: {
      polyfill: true, // 초기 라우트 청크를 index.js와 병렬로 다운로드
    },
    rollupOptions: {
      output: {
        // 너무 작은 청크는 부모 청크에 병합
        experimentalMinChunkSize: 10000, // 10KB 미만은 병합
        manualChunks: (id) => {
          // Vendor 분리 (캐싱 효율성)
          if (id.includes("node_modules")) {
            // Router
            if (id.includes("react-router")) return "vendor-router";

            // TanStack Query (상태 관리)
            if (id.includes("@tanstack")) return "vendor-query";

            // Radix UI (UI 라이브러리)
            if (id.includes("@radix-ui")) return "vendor-ui";

            // 아이콘 라이브러리 (용량이 크고 자주 변경 안됨)
            if (id.includes("react-icons")) return "vendor-icons";

            // 나머지 vendor (React 포함)
            return "vendor";
          }

          // 공통 UI 컴포넌트를 별도 청크로 분리
          if (
            id.includes("/components/Button") ||
            id.includes("/components/Modal")
          ) {
            return "components-common";
          }

          // 큰 페이지 그룹만 분리 (나머지는 자동 code splitting)
          // Interview 관련 페이지들은 함께 사용될 가능성이 높음
          if (id.includes("/pages/Interview/pages/")) {
            return "pages-interview";
          }

          // Mypage의 여러 탭들도 함께 사용될 가능성이 높음
          if (id.includes("/pages/Mypage/components/")) {
            return "pages-mypage";
          }

          if (id.includes("/pages/CoverLetterAnalysis/components/")) {
            return "pages-cover-letter-analysis";
          }

          // 나머지는 Vite가 자동으로 분리 (dynamic import 기반)
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
