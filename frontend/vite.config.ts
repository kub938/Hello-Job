import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// import { visualizer } from "rollup-plugin-visualizer";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // visualizer({
    //   //번들 시각화를 위함
    //   open: true, // 빌드 후 자동으로 시각화 파일 열기
    //   filename: "stats.html", // 출력 파일명
    //   gzipSize: true, // gzip 크기 표시
    //   brotliSize: true, // brotli 크기 표시
    // }),
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
