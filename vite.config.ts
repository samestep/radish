import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: { drawing: "drawing/index.html" },
      output: {
        manualChunks: {
          "flexlayout-react": ["flexlayout-react"],
          "react-firebaseui": ["react-firebaseui"],
        },
      },
    },
  },
  plugins: [react()],
});
