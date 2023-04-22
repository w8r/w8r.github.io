import { defineConfig } from "vite";
import { resolve } from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // eslint-disable-next-line no-undef
  define: { TEST: process.env.TEST || false },
  plugins: [],
  root: resolve(__dirname, "web"),

  // eslint-disable-next-line no-undef
  build: {
    lib: {
      // eslint-disable-next-line no-undef
      entry: resolve(__dirname, "src", "index.ts"),
      name: "w8r",
    },
    emptyOutDir: false,
    outDir: resolve(__dirname, "dist"),
  },
});
