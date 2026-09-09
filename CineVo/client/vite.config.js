import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The app is served from the Express service at the domain root in production.
  base: "/",
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
  build: {
    // The Express service serves this production build directly.
    outDir: "../dist",
    emptyOutDir: true,
  },
});
