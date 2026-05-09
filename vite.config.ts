import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.VITE_WP_URL ?? "https://votre-wordpress.com").replace(/\/+$/, "");

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      historyApiFallback: true,
      proxy: {
        "/wp-json": {
          target,
          changeOrigin: true,
          secure: false,
        },
        "/graphql": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
