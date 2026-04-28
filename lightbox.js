(() => {
  const clickableImages = Array.from(document.querySelectorAll("main img")).filter((img) => {
    return !img.closest(".dot-logo, .other-record-link") && !img.classList.contains("project-hero-image");
  });

  if (!clickableImages.length) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "image-lightbox";
  overlay.setAttribute("aria-hidden", "true");

  const stage = document.createElement("div");
  stage.className = "image-lightbox-stage";

  const media = document.createElement("div");
  media.className = "image-lightbox-media";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "image-lightbox-close";
  closeButton.setAttribute("aria-label", "Close image preview");
  closeButton.textContent = "×";

  const image = document.createElement("img");
  image.className = "image-lightbox-image";
  image.alt = "";

  const controls = document.createElement("div");
  controls.className = "image-lightbox-controls";

  const zoomOutButton = document.createElement("button");
  zoomOutButton.type = "button";
  zoomOutButton.className = "image-lightbox-zoom";
  zoomOutButton.setAttribute("aria-label", "Zoom out");
  zoomOutButton.textContent = "-";

  const zoomInButton = document.createElement("button");
  zoomInButton.type = "button";
  zoomInButton.className = "image-lightbox-zoom";
  zoomInButton.setAttribute("aria-label", "Zoom in");
  zoomInButton.textContent = "+";

  const hint = document.createElement("p");
  hint.className = "image-lightbox-hint";
  hint.textContent = "Scroll to zoom";

  controls.append(zoomOutButton, hint, zoomInButton);
  media.append(image, closeButton);
  stage.append(media, controls);
  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  let isOpen = false;
  let currentScale = 1;
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const SCALE_STEP = 0.2;
  let previousBodyOverflow = "";

  function applyScale() {
    image.style.transform = `scale(${currentScale})`;
    image.style.cursor = currentScale > 1 ? "zoom-out" : "zoom-in";
  }

  function setScale(nextScale) {
    currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
    applyScale();
  }

  function openLightbox(sourceImage) {
    image.src = sourceImage.currentSrc || sourceImage.src;
    image.alt = sourceImage.alt || "Expanded project image";
    setScale(1);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    isOpen = true;
  }

  function closeLightbox() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    isOpen = false;
  }

  clickableImages.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openLightbox(img));
  });

  closeButton.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeLightbox();
    }
  });

  image.addEventListener("click", (event) => {
    event.stopPropagation();
    if (currentScale > 1) {
      setScale(1);
      return;
    }
    setScale(currentScale + SCALE_STEP);
  });

  zoomInButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setScale(currentScale + SCALE_STEP);
  });

  zoomOutButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setScale(currentScale - SCALE_STEP);
  });

  overlay.addEventListener(
    "wheel",
    (event) => {
      if (!isOpen) {
        return;
      }
      event.preventDefault();
      const direction = event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP;
      setScale(currentScale + direction);
    },
    { passive: false }
  );

  document.addEventListener("keydown", (event) => {
    if (!isOpen) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      setScale(currentScale + SCALE_STEP);
      return;
    }

    if (event.key === "-") {
      setScale(currentScale - SCALE_STEP);
    }
  });
})();

(() => {
  const backToTopLinks = Array.from(document.querySelectorAll(".back-link"));
  if (!backToTopLinks.length) {
    return;
  }

  const SCROLL_DURATION_MS = 220;
  let animationFrameId = null;

  function easeOutCubic(progress) {
    return 1 - Math.pow(1 - progress, 3);
  }

  function scrollToTopFast() {
    const startY = window.scrollY || window.pageYOffset;
    if (startY <= 0) {
      return;
    }

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1);
      const easedProgress = easeOutCubic(progress);
      const nextY = Math.round(startY * (1 - easedProgress));

      window.scrollTo(0, nextY);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationFrameId = null;
      }
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  backToTopLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToTopFast();
    });
  });
})();
