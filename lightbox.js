(() => {
  const clickableImages = Array.from(document.querySelectorAll("main img")).filter((img) => {
    return (
      !img.closest(".dot-logo, .other-record-link, .flavor-folder") &&
      !img.classList.contains("project-hero-image")
    );
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

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "image-lightbox-nav image-lightbox-nav-prev";
  previousButton.setAttribute("aria-label", "Previous image");
  previousButton.textContent = "‹";

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "image-lightbox-nav image-lightbox-nav-next";
  nextButton.setAttribute("aria-label", "Next image");
  nextButton.textContent = "›";

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
  media.append(image, closeButton, previousButton, nextButton);
  stage.append(media, controls);
  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  let isOpen = false;
  let currentScale = 1;
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;
  const SCALE_STEP = 0.2;
  let previousBodyOverflow = "";
  let currentGroup = [];
  let currentIndex = 0;

  function applyScale() {
    image.style.transform = `scale(${currentScale})`;
    image.style.cursor = currentScale > 1 ? "zoom-out" : "zoom-in";
  }

  function setTransformOriginFromPoint(clientX, clientY) {
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    image.style.transformOrigin = `${clampedX}% ${clampedY}%`;
  }

  function setScale(nextScale) {
    currentScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
    applyScale();
  }

  function setDisplayedImage(sourceImage) {
    image.src = sourceImage.currentSrc || sourceImage.src;
    image.alt = sourceImage.alt || "Expanded project image";
    image.style.transformOrigin = "50% 50%";
    setScale(1);
  }

  function updateNavigationState() {
    const hasCarousel = currentGroup.length > 1;
    overlay.classList.toggle("has-carousel", hasCarousel);
    previousButton.disabled = !hasCarousel;
    nextButton.disabled = !hasCarousel;
  }

  function openLightbox(sourceImage, group = [sourceImage], startIndex = 0) {
    currentGroup = group;
    currentIndex = Math.max(0, Math.min(group.length - 1, startIndex));
    setDisplayedImage(currentGroup[currentIndex]);
    updateNavigationState();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    isOpen = true;
  }

  function showRelativeImage(step) {
    if (currentGroup.length < 2) return;
    currentIndex = (currentIndex + step + currentGroup.length) % currentGroup.length;
    setDisplayedImage(currentGroup[currentIndex]);
  }

  function closeLightbox() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = previousBodyOverflow;
    isOpen = false;
    currentGroup = [];
    currentIndex = 0;
  }

  clickableImages.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      const flavorGrid = img.closest(".flavor-grid");
      if (!flavorGrid) {
        openLightbox(img);
        return;
      }
      const flavorImages = Array.from(flavorGrid.querySelectorAll("img"));
      const startIndex = Math.max(0, flavorImages.indexOf(img));
      openLightbox(img, flavorImages, startIndex);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  previousButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showRelativeImage(-1);
  });
  nextButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showRelativeImage(1);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeLightbox();
    }
  });

  media.addEventListener("click", (event) => {
    if (event.target === media) {
      closeLightbox();
    }
  });

  image.addEventListener("click", (event) => {
    event.stopPropagation();
    setTransformOriginFromPoint(event.clientX, event.clientY);
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
      setTransformOriginFromPoint(event.clientX, event.clientY);
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
      return;
    }

    if (event.key === "ArrowLeft") {
      showRelativeImage(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      showRelativeImage(1);
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
