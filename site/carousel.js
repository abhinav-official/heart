(() => {
  const carousels = document.querySelectorAll("[data-carousel]");
  for (const root of carousels) {
    const track = root.querySelector("[data-carousel-track]");
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    const dotsWrap = root.querySelector("[data-carousel-dots]");
    if (!track || !prev || !next || !dotsWrap) continue;

    const cards = Array.from(track.querySelectorAll(".carousel-card"));
    if (cards.length === 0) continue;

    const dots = cards.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carousel-dot";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => scrollToIndex(i));
      dotsWrap.appendChild(b);
      return b;
    });

    function cardWidth() {
      const card = cards[0];
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function currentIndex() {
      const w = cardWidth();
      if (!w) return 0;
      return Math.round(track.scrollLeft / w);
    }

    function scrollToIndex(i) {
      const w = cardWidth();
      const max = cards.length - 1;
      const idx = Math.max(0, Math.min(max, i));
      track.scrollTo({ left: idx * w, behavior: "smooth" });
    }

    function update() {
      const idx = currentIndex();
      dots.forEach((d, i) => {
        const active = i === idx;
        d.classList.toggle("active", active);
        d.setAttribute("aria-current", active ? "true" : "false");
      });
      prev.disabled = idx <= 0;
      next.disabled = idx >= cards.length - 1;
    }

    prev.addEventListener("click", () => scrollToIndex(currentIndex() - 1));
    next.addEventListener("click", () => scrollToIndex(currentIndex() + 1));
    track.addEventListener("scroll", () => window.requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    update();
  }
})();
