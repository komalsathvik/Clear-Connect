import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true, // optional but helps in some cases
    }),
  ],
  define: {
    global: {},
    process: {},
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      buffer: "buffer",
    },
  },
});
