# Language Runtime Puzzle

Astro static site with a React island, TanStack Table v8, and DnD Kit. The page turns a programming language comparison table into a fill-in-the-blank puzzle.

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build |

## GitHub Pages

The Astro config uses `site: 'https://leovoon.github.io'`. The repository is a GitHub Pages user site, so no `base` path is configured.

Deployment is handled by `.github/workflows/deploy.yml`. In GitHub, set Pages source to GitHub Actions.
