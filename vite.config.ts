import {defineConfig, loadEnv, type PluginOption} from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// @ts-ignore
export default defineConfig( async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env': env
    },
    server: {
      host: "::",
      port: 3000,
    },
    logLevel: 'info',
    build: {
      chunkSizeWarningLimit: 10000,
    },
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
          ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
                m.cartographer(),
            ),
          ]
          : []),
    ] as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
