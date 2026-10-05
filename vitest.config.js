import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Same aliases Quasar uses in the app
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      boot: path.resolve(__dirname, "./src/boot"),
      components: path.resolve(__dirname, "./src/components"),
      layouts: path.resolve(__dirname, "./src/layouts"),
      pages: path.resolve(__dirname, "./src/pages"),
      stores: path.resolve(__dirname, "./src/stores"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.js"],
  },
});
