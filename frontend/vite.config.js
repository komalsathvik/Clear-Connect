import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true, // optional
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
