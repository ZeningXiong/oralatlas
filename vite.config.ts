import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "three", test: /node_modules[\/](three|three-mesh-bvh)/ },
            { name: "react", test: /node_modules[\/](react|react-dom|scheduler|zustand)/ },
          ],
        },
      },
    },
  },
});
