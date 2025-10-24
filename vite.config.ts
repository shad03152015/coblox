import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Exclude large world files from bundling
      external: [
        /\/world\/.*\.mca$/,
        /\/world\/.*\.dat$/,
      ],
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    // Exclude prismarine packages from pre-bundling to avoid eval issues and memory problems
    exclude: [
      'prismarine-nbt',
      'prismarine-chunk',
      'prismarine-viewer',
      'minecraft-data',
    ],
  },
  publicDir: path.resolve(import.meta.dirname, "client/public"),
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
      // Allow serving world files from client/world directory
      allow: [
        path.resolve(import.meta.dirname, "client"),
        path.resolve(import.meta.dirname, "node_modules"),
      ],
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
});
