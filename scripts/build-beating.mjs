import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "site", "beating.json");
const outPath = path.join(root, "site", "index.html");

const entries = JSON.parse(readFileSync(dataPath, "utf8"));

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function countLabel(n) {
  return String(n).padStart(2, "0");
}

function renderMaker(entry) {
  return `          <article class="swiper-slide maker-card">
            <div class="card-top">
              <h3 class="project-name"><a href="${esc(entry.repo)}" target="_blank" rel="noopener noreferrer">${esc(entry.name)}</a></h3>
              <span class="status-pill frozen-pill"><span class="pulse-dot" aria-hidden="true"></span>FROZEN BY MAKER</span>
            </div>
            <dl class="lines">
              <div class="line"><dt>What</dt><dd>${esc(entry.what)}</dd></div>
              <div class="line"><dt>Why</dt><dd>${esc(entry.why)}</dd></div>
              <div class="line"><dt>Whom</dt><dd>${esc(entry.whom)}</dd></div>
            </dl>
            <p class="heartbeat">Heartbeat: last frozen ${esc(entry.last_frozen)}</p>
          </article>`;
}

function renderExample(entry) {
  return `        <article class="example-card">
          <div class="card-top">
            <h3 class="project-name"><a href="${esc(entry.repo)}" target="_blank" rel="noopener noreferrer">${esc(entry.name)}</a></h3>
            <span class="status-pill example-pill">EXAMPLE</span>
          </div>
          <p class="example-what">${esc(entry.what)}</p>
        </article>`;
}

const makers = entries.filter((e) => e.status === "maker");
const examples = entries.filter((e) => e.status === "example");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Beating</title>
  <meta name="description" content="Projects that carry a heart.lock, and what their hearts say.">
  <link rel="canonical" href="https://heart.zcurv.com/">
  <meta name="theme-color" content="#111113">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Beating">
  <meta property="og:title" content="Beating: projects that carry a heart.lock">
  <meta property="og:description" content="Projects that carry a heart.lock, and what their hearts say.">
  <meta property="og:url" content="https://heart.zcurv.com/">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Beating: projects that carry a heart.lock">
  <meta name="twitter:description" content="Projects that carry a heart.lock, and what their hearts say.">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="bg-glow bg-glow-a" aria-hidden="true"></div>
  <div class="bg-glow bg-glow-b" aria-hidden="true"></div>
  <main>
    <header class="hero">
      <div class="heart-wrap" aria-hidden="true">
        <span class="heart-halo"></span>
        <span class="heart-halo heart-halo-delay"></span>
        <svg class="hero-heart" viewBox="0 0 24 24" fill="none">
          <path d="M12 20.5C10.2 18.9 4 14 4 9.2C4 6.3 6.2 4 9 4C10.7 4 12.2 4.8 13 6C13.8 4.8 15.3 4 17 4C19.8 4 22 6.3 22 9.2C22 14 15.8 18.9 14 20.5L12 22L10 20.5Z" fill="#C83E3B"/>
        </svg>
      </div>
      <h1>Beating</h1>
      <p class="intro">Projects with a heart.lock.</p>
      <div class="ecg-divider" aria-hidden="true">
        <span class="ecg-line"></span>
        <svg class="ecg-spike" viewBox="0 0 24 24" fill="none"><path d="M1 12H8L10 4L14 20L16 12H23" stroke="#C83E3B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="ecg-line"></span>
      </div>
    </header>

    <section class="makers" aria-labelledby="frozen">
      <div class="section-head">
        <div class="section-title-wrap">
          <h2 id="frozen">Frozen by the maker</h2>
          <span class="count-pill">${countLabel(makers.length)}</span>
        </div>
        <div class="carousel-controls">
          <button type="button" class="carousel-btn swiper-prev" aria-label="Previous project">&#8592;</button>
          <button type="button" class="carousel-btn swiper-next" aria-label="Next project">&#8594;</button>
        </div>
      </div>
      <div class="swiper maker-swiper">
        <div class="swiper-wrapper">
${makers.map(renderMaker).join("\n\n")}
        </div>
      </div>
      <div class="swiper-pagination maker-pagination"></div>
    </section>

    <section class="examples-area" aria-labelledby="examples">
      <div class="section-title-wrap">
        <h2 id="examples">Examples</h2>
        <span class="count-pill muted-count">${countLabel(examples.length)}</span>
      </div>
      <div class="examples-grid">
${examples.map(renderExample).join("\n\n")}
      </div>
    </section>

    <section class="claim-section" aria-labelledby="claim">
      <div class="section-title-wrap">
        <h2 id="claim">Claim your listing</h2>
      </div>
      <p class="claim-copy">Add a <code>heart.lock</code>, open a PR, get verified.</p>
      <a class="btn-crimson" href="https://github.com/abhinav-official/heart/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">How to claim</a>
    </section>

    <footer>
      <p>Beating is part of <a href="https://github.com/abhinav-official/heart">heartlock</a>.</p>
    </footer>
  </main>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  <script>
    (() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const swiper = new Swiper('.maker-swiper', {
        effect: 'slide',
        centeredSlides: true,
        grabCursor: true,
        slidesPerView: 1.08,
        spaceBetween: 16,
        speed: reduce ? 0 : 850,
        loop: true,
        autoplay: reduce ? false : { delay: 3400, disableOnInteraction: false, pauseOnMouseEnter: true },
        pagination: { el: '.maker-pagination', clickable: true },
        navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' },
        keyboard: { enabled: true },
        a11y: { enabled: true },
        breakpoints: {
          640: { slidesPerView: 1.25, spaceBetween: 20 },
          980: { slidesPerView: 1.55, spaceBetween: 28 }
        }
      });
      if (reduce) swiper.autoplay.stop();
    })();
  </script>
</body>
</html>
`;

writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${entries.length} entries)`);
