import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      historyApiFallback: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      compression({ algorithm: "gzip", ext: ".gz" }),
      compression({ algorithm: "brotliCompress", ext: ".br" }),
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, ".") },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("lucide-react")) return "vendor-lucide";
            if (id.includes("recharts")) return "vendor-recharts";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("react-dom")) return "vendor-react";
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("react-helmet")) return "vendor-helmet";
            if (id.includes("@google/genai")) return "vendor-genai";
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      target: "es2019",
      minify: "esbuild",
      cssCodeSplit: true,
      sourcemap: false,
    },
  };
});