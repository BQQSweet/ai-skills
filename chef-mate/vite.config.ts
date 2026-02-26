import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import tailwindcss from "tailwindcss";
import tailwindcssNesting from "@tailwindcss/nesting";
import tailwindcssConfig from "./tailwind.config"; // 注意匹配实际文件
import { fileURLToPath, URL } from "node:url";
import postcssPresetEnv from "postcss-preset-env";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcssNesting(),
        tailwindcss({
          config: tailwindcssConfig,
        }),
        postcssPresetEnv({
          stage: 3,
          features: { "nesting-rules": false },
        }),
      ],
    },
  },
});
