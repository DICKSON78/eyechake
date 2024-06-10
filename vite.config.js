import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
  optimizeDeps: {
    include: ["@mui/material", "@mui/icons-material"],
  },
  build: {
    chunkSizeWarningLimit: 100,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [
    laravel({
      input: ["resources/js/app.jsx"],
      refresh: true,
    }),
  ],
});
