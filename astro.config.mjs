import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import react from "@astrojs/react";
import prefetch from "@astrojs/prefetch";

// https://astro.build/config
export default defineConfig({
  site: "https://leovoon.github.io",

  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "dracula-soft",
      wrap: false,
      langs: ["js", "ts", "jsx", "vue", "svelte", "html", "css", "json", "md", "shell"],
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    svelte(),
    vue({
      appEntrypoint: "/src/pages/_vueApp",
    }),
    react(),
    prefetch(),
  ],
});
