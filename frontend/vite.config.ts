import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/notes/",
  plugins: [react()],
  server: {
    proxy: {
      "/notes/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/notes/, ""),
      },
    },
  },
});
