import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
  environment: "jsdom",
  setupFiles: ["./vitest.setup.ts"],
  globals: true,
  include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
  exclude: ["node_modules", ".next", "tests/e2e/**"],
},
});