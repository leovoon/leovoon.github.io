const plugin = require("tailwindcss/plugin");
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "bien-glass": (value, { modifier }) => {
            const extendedBy = modifier || "6rem";
            const cutoff = `calc(100% - ${extendedBy})`;

            return {
              "&::after": {
                content: "''",
                'pointer-events': "none",
                position: "absolute",
                inset: "0",
                // Extend backdrop surface to the bottom
                bottom: `calc(-1 * ${extendedBy})`,
                // Mask out the part falling outside the nav
                "-webkit-mask-image": `linear-gradient(to bottom, black 0, black ${cutoff}, transparent ${cutoff})`,
                "backdrop-filter": `blur(${value || "1rem"})`,
              },
            };
          },
        },
        {
          values: {
            ...theme("spacing"),
            DEFAULT: theme("spacing.4"),
          },
          modifiers: theme("spacing"),
        }
      );
    }),
    require("@tailwindcss/typography"),
  ],
};
