module.exports = {
  //   ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  plugins: [
    require("tailwindcss")("./tailwind.config.cjs"),
    require("autoprefixer"),
    require("cssnano")({
      preset: "advanced",
    }),
  ],
};
