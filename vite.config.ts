/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name: "mindwired",
      fileName: "mind-wired",
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "/src"),
    },
  },
  test: {
    watch: false,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    deps: {
      optimizer: {
        web: {
          include: ["vitest-canvas-mock"],
        },
      },
    },
    coverage: {
      enabled: false,
    },
  },
});
