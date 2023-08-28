let x = 0,
  y = 0;
let mouseX = 0,
  mouseY = 0;

const updateCursor = () => {
  x += (mouseX - x) * 0.1;
  y += (mouseY - y) * 0.1;

  document.documentElement.style.setProperty("--x", x);
  document.documentElement.style.setProperty("--y", y);

  requestAnimationFrame(updateCursor);
};

const handlePointerMove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
};

const handlePageUnload = () => {
  if (window.location.pathname !== "/") {
    document.removeEventListener("pointermove", handlePointerMove);
  }
};

function initializeCursorHoverEffect() {
  updateCursor();
  document.addEventListener("pointermove", handlePointerMove);
}

initializeCursorHoverEffect();

window.addEventListener("popstate", initializeCursorHoverEffect);
document.addEventListener("astro:beforeload", handlePageUnload);
