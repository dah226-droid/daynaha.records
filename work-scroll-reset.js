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
})();
