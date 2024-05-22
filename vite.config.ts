import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: { drawing: "drawing/index.html" },
      output: { manualChunks: { "react-firebaseui": ["react-firebaseui"] } },
    },
  },
  plugins: [react()],
});
