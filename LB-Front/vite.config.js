import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0", // 또는 true
    port: 5173,
    allowedHosts: ["local.smartds.tv"],
    open: "", // npm run dev 시 http://localhost:5173 이 Chrome에서 자동으로 열림
  },
});
