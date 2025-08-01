import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, './client'),
  resolve: {
    alias: {
      "@": resolve(__dirname, './client/src'),
      "@shared": resolve(__dirname, './shared'),
      "@assets": resolve(__dirname, './attached_assets'),
    },
  },
  build: {
    outDir: resolve(__dirname, './dist/public'),
    emptyOutDir: true,
  },
});
