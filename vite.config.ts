import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      historyApiFallback: true,
    },
    plugins: [react(), tailwindcss()],
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
          manualChunks: {
            // Split massive deps into separate cached chunks
            "vendor-react": ["react", "react-dom"],
            "vendor-router": ["react-router-dom"],
            "vendor-supabase": ["@supabase/supabase-js"],
            "vendor-recharts": ["recharts"], // only loads on Dashboard
            "vendor-genai": ["@google/genai"], // only loads when Gemini used
            "vendor-lucide": ["lucide-react"],
            "vendor-helmet": ["react-helmet-async"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      target: "esnext",
      minify: "esbuild",
    },
  };
});
