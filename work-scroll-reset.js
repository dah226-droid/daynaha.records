(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function resetToTop() {
    window.scrollTo(0, 0);
  }

  // Cover standard page load and bfcache restores.
  window.addEventListener("load", resetToTop);
  window.addEventListener("pageshow", resetToTop);

  function lockWorkVinylImageDrag() {
    const vinylImages = document.querySelectorAll(".project-hero-image");
    if (!vinylImages.length) return;

    vinylImages.forEach((image) => {
      image.setAttribute("draggable", "false");
      image.addEventListener("dragstart", (event) => {
        event.preventDefault();
      });
    });
  }

  window.addEventListener("DOMContentLoaded", lockWorkVinylImageDrag);
  window.addEventListener("pageshow", lockWorkVinylImageDrag);
})();
