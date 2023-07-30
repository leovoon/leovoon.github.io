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

let observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // If #post-container is in view, remove the pointermove event listener.
      document.body.addEventListener("pointermove", handlePointerMove);
    } else {
      // If #post-container is not in view, add the pointermove event listener.
      document.body.removeEventListener("pointermove", handlePointerMove);
    }
  });
});

// Start observing #posts-container.
let target = document.getElementById("posts-container");

// Initialize cursor movement.
if (window.matchMedia("(min-width: 425px)").matches) {
  observer.observe(target);
  // If media query matches
  updateCursor();
}
