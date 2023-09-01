import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import vue from "@astrojs/vue";
import react from "@astrojs/react";
import prefetch from "@astrojs/prefetch";
import compress from "astro-compress";
import rome from "astro-rome";
import Worker from "astrojs-service-worker";

// https://astro.build/config
export default defineConfig({
  site: "https://leovoon.github.io",

  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "dracula-soft",
      wrap: false,
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
    vue({
      appEntrypoint: "/src/pages/_vueApp",
    }),
    react(),
    prefetch(),
    compress({ Logger: 1 }),
    rome({ Logger: 1 }),
    import.meta.env.MODE === "production" ? Worker() : null,
  ],
});
