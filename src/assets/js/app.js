(() => {
  const header = document.querySelector("[data-header]");
  const filters = [...document.querySelectorAll("[data-filter]")];
  const items = [...document.querySelectorAll(".gallery-item")];
  const triggers = [...document.querySelectorAll(".gallery-trigger")];
  const visibleCount = document.querySelector("[data-visible-count]");
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxWebp = document.querySelector("[data-lightbox-webp]");
  const lightboxTitle = document.querySelector("[data-lightbox-title]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const lightboxCategory = document.querySelector("[data-lightbox-category]");
  const lightboxCount = document.querySelector("[data-lightbox-count]");
  const closeButton = document.querySelector("[data-lightbox-close]");
  const previousButton = document.querySelector("[data-lightbox-prev]");
  const nextButton = document.querySelector("[data-lightbox-next]");
  const year = document.querySelector("[data-current-year]");
  let activeIndex = 0;
  let currentTriggers = [...triggers];
  let lastTrigger = null;
  let pointerStartX = null;

  if (year) year.textContent = String(new Date().getFullYear());

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 80);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      filters.forEach((filter) => {
        const active = filter === button;
        filter.classList.toggle("is-active", active);
        filter.setAttribute("aria-pressed", String(active));
      });

      items.forEach((item) => {
        item.hidden = category !== "Alle" && item.dataset.category !== category;
      });

      currentTriggers = triggers.filter((trigger) => !trigger.closest(".gallery-item").hidden);
      if (visibleCount) visibleCount.textContent = String(currentTriggers.length);
    });
  });

  const showImage = (index) => {
    activeIndex = (index + currentTriggers.length) % currentTriggers.length;
    const trigger = currentTriggers[activeIndex];
    const jpg = trigger.dataset.jpg;
    const webp = trigger.dataset.webp;

    lightboxWebp.srcset = `${webp}-1600.webp 1600w, ${webp}-2400.webp 2400w`;
    lightboxImage.src = `${jpg}-1600.jpg`;
    lightboxImage.srcset = `${jpg}-1600.jpg 1600w, ${jpg}-2400.jpg 2400w`;
    lightboxImage.sizes = "100vw";
    lightboxImage.alt = trigger.dataset.alt;
    lightboxTitle.textContent = trigger.dataset.title;
    lightboxCaption.textContent = trigger.dataset.caption;
    lightboxCategory.textContent = trigger.dataset.categoryLabel;
    lightboxCount.textContent = `${activeIndex + 1} / ${currentTriggers.length}`;
  };

  const openLightbox = (trigger) => {
    lastTrigger = trigger;
    activeIndex = currentTriggers.indexOf(trigger);
    showImage(activeIndex);
    document.body.classList.add("lightbox-open");
    lightbox.showModal();
  };

  triggers.forEach((trigger) => trigger.addEventListener("click", () => openLightbox(trigger)));

  previousButton.addEventListener("click", () => showImage(activeIndex - 1));
  nextButton.addEventListener("click", () => showImage(activeIndex + 1));
  closeButton.addEventListener("click", () => lightbox.close());

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener("close", () => {
    document.body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("srcset");
    lightboxWebp.removeAttribute("srcset");
    lastTrigger?.focus();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showImage(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showImage(activeIndex + 1);
    }
  });

  lightbox.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
  });

  lightbox.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) < 60) return;
    showImage(distance > 0 ? activeIndex - 1 : activeIndex + 1);
  });
})();
