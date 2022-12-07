import { defineConfig } from 'astro/config'
import purgecss from 'astro-purgecss'

// https://astro.build/config
export default defineConfig({
  site: 'https://leovoon.github.io',
  integrations: [
    purgecss({
      fontFace: true,
      keyframes: true,
      variables: true,
      rejected: true,
    }),
  ],
})
