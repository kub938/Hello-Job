import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import removeConsole from "vite-plugin-remove-console";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    removeConsole({
      external: ["src/pages/Home/Home.tsx"],
    }),
    visualizer({
      open: true,
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
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
      polyfill: true,
    },
    rollupOptions: {
      output: {
        experimentalMinChunkSize: 10000,
        manualChunks: (id) => {
          if (
            id.includes("/components/Button") ||
            id.includes("/components/Modal")
          ) {
            return "components-common";
          }

          if (id.includes("/pages/Interview/pages/")) {
            return "pages-interview";
          }

          if (id.includes("/pages/Mypage/components/")) {
            return "pages-mypage";
          }

          if (id.includes("/pages/CoverLetterAnalysis/CoverLetterAnalysis/")) {
            return "pages-cover-letter-analysis";
          }
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
