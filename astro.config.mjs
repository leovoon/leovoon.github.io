import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  site: "https://leovoon.github.io",
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "dracula-soft",
      wrap: true,
      langs: [
        "js",
        "ts",
        "jsx",
        "vue",
        "svelte",
        "html",
        "css",
        "json",
        "md",
        "shell",
      ],
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    svelte(),
    tailwind(),
    vue({
      appEntrypoint: "/src/pages/_vueApp",
    }),
  ],
});
