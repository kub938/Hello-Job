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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
          if (id.includes("/pages/Interview/")) return "interview";
          if (id.includes("/pages/Mypage/")) return "mypage";
          if (id.includes("/pages/CoverLetter/")) return "cover-letter";
          if (id.includes("/pages/CoverLetterAnalysis/"))
            return "cover-letter-analysis";
          if (
            id.includes("/pages/CorporateResearch") ||
            id.includes("/pages/CorporateSearch")
          )
            return "corporate";
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
