import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    https: false, // Force HTTP instead of HTTPS
    cors: true,
    hmr: {
      host: 'localhost',
    },
    watch: {
      // Improves reliability of Hot Module Reload on Windows and network drives
      usePolling: true,
    },
  },
  // Ensure production builds don't reference development server
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  optimizeDeps: {
    include: ["@mui/material", "@mui/icons-material"],
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Enable code splitting for better performance
        manualChunks: {
          // Vendor chunks for large libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/system'],
          'vendor-pdf': ['@react-pdf/renderer'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
        },
        entryFileNames: 'app-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      },
      onwarn(warning, warn) {
        // Suppress "use strict" directive warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        // Suppress commonjs resolver warnings
        if (warning.code === "UNKNOWN" && warning.message.includes("commonjs--resolver")) {
          return;
        }
        warn(warning);
      },
    },
    // Ensure assets are built for production
    outDir: 'public/build',
    assetsDir: '',
    manifest: true,
  },
  plugins: [
    laravel({
      input: ["resources/js/app.jsx"],
      refresh: true,
      detectTls: false, // Disable TLS detection
    }),
    react({
      // Configure React Fast Refresh
      jsxRuntime: 'automatic',
      // Include all JSX files
      include: '**/*.{jsx,tsx}',
    }), // Enables React Fast Refresh and JSX support
  ],
});
