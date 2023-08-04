const updateCursor = ({ x, y }) => {
  document.querySelector(":root").style.setProperty("--x", x);
  document.querySelector(":root").style.setProperty("--y", y);
};

document.body.addEventListener("pointermove", (e) => {
  const x = e.clientX;
  const y = e.clientY;
  updateCursor({ x, y });
});
