
let __unconfig_data;
let __unconfig_stub = function (data = {}) { __unconfig_data = data };
__unconfig_stub.default = (data = {}) => { __unconfig_data = data };
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import vue from "@astrojs/vue";

import react from "@astrojs/react";

// https://astro.build/config
const __unconfig_default =  defineConfig({
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
    vue({
      appEntrypoint: "/src/pages/_vueApp",
    }),
    react(),
    tailwind(),
  ],
});

if (typeof __unconfig_default === "function") __unconfig_default(...[]);export default __unconfig_data;