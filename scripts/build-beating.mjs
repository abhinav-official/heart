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

function fileTab(entry) {
  return `            <div class="file-tab">
              <div class="file-tab-left">
                <svg class="file-lock" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="file-name">${esc(entry.name)} <span class="file-sep">/</span> heart.lock</span>
              </div>
              <a class="file-link" href="${esc(entry.repo)}" aria-label="Open ${esc(entry.name)} repository" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3h7v7M13 3L6 10M13 13H3V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
            </div>`;
}

function specRows(entry) {
  return `            <dl class="spec-sheet">
              <div class="spec-row"><dt>WHAT</dt><dd>${esc(entry.what)}</dd></div>
              <div class="spec-row"><dt>WHY</dt><dd>${esc(entry.why)}</dd></div>
              <div class="spec-row"><dt>WHOM</dt><dd>${esc(entry.whom)}</dd></div>
            </dl>`;
}

function renderMaker(entry) {
  return `          <article class="swiper-slide maker-card">
${fileTab(entry)}
            <div class="card-body">
              <div class="card-head">
                <h3 class="project-name"><a href="${esc(entry.repo)}" target="_blank" rel="noopener noreferrer">${esc(entry.name)}</a></h3>
                <span class="status-pill frozen-pill"><span class="pulse-dot" aria-hidden="true"></span>FROZEN BY MAKER</span>
              </div>
${specRows(entry)}
            </div>
            <div class="card-footer">
              <span>Heartbeat: last frozen ${esc(entry.last_frozen)}</span>
            </div>
          </article>`;
}

function renderExample(entry) {
  return `        <article class="example-card">
${fileTab(entry)}
          <div class="card-body">
            <div class="card-head">
              <h3 class="project-name"><a href="${esc(entry.repo)}" target="_blank" rel="noopener noreferrer">${esc(entry.name)}</a></h3>
              <span class="status-pill example-pill">EXAMPLE</span>
            </div>
${specRows(entry)}
          </div>
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <header class="hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-content">
        <div class="heart-wrap" aria-hidden="true">
          <span class="heart-halo"></span>
          <span class="heart-halo heart-halo-delay"></span>
          <svg class="hero-heart" viewBox="0 0 24 24" fill="none">
            <path d="M12 20.5C10.2 18.9 4 14 4 9.2C4 6.3 6.2 4 9 4C10.7 4 12.2 4.8 13 6C13.8 4.8 15.3 4 17 4C19.8 4 22 6.3 22 9.2C22 14 15.8 18.9 14 20.5L12 22L10 20.5Z" fill="#C83E3B"/>
          </svg>
        </div>
        <p class="eyebrow">The heart.lock directory</p>
        <h1>Beating</h1>
        <p class="intro">Projects that carry a heart.lock, and what their hearts say.</p>
        <div class="ecg-divider" aria-hidden="true">
          <span class="ecg-line"></span>
          <svg class="ecg-spike" viewBox="0 0 24 24" fill="none"><path d="M1 12H8L10 4L14 20L16 12H23" stroke="#C83E3B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span class="ecg-line"></span>
        </div>
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

    <section class="examples-band" aria-labelledby="examples">
      <div class="examples-inner">
        <div class="section-title-wrap">
          <h2 id="examples">Examples</h2>
          <span class="count-pill muted-count">${countLabel(examples.length)}</span>
        </div>
        <p class="note examples-note">These are example hearts, written in the same format to show what a heart.lock could say. Each is clearly marked <strong>EXAMPLE</strong> until its makers freeze a real one.</p>
        <div class="examples-grid">
${examples.map(renderExample).join("\n\n")}
        </div>
      </div>
    </section>

    <section class="cta-section claim-section" aria-labelledby="claim">
      <div class="section-title-wrap">
        <h2 id="claim">Claim your listing</h2>
      </div>
      <div class="timeline">
        <div class="timeline-step">
          <div class="timeline-marker"><span class="step-circle hollow"></span><span class="step-num">01</span></div>
          <p class="step-text">Add a <code>heart.lock</code> to your repo and freeze it.</p>
        </div>
        <div class="timeline-step">
          <div class="timeline-marker"><span class="step-circle hollow"></span><span class="step-num">02</span></div>
          <p class="step-text">Open a pull request against the <a href="https://github.com/abhinav-official/heart">heartlock repo</a> adding your entry to <code>site/beating.json</code>.</p>
        </div>
        <div class="timeline-step">
          <div class="timeline-marker"><span class="step-circle hollow"></span><span class="step-num">03</span></div>
          <p class="step-text">Your entry is verified against the <code>heart.lock</code> in your repo before it merges.</p>
        </div>
        <div class="timeline-step last">
          <div class="timeline-marker"><span class="step-circle solid"></span><span class="step-num">04</span></div>
          <p class="step-text">Once merged and deployed, you are listed as <strong>frozen by the maker</strong>.</p>
        </div>
      </div>
      <p class="note claim-note">Claiming an example works the same way: the PR changes that entry's status to <code>maker</code> with the true freeze date.</p>
    </section>

    <section class="cta-section give-section" aria-labelledby="give">
      <div class="section-title-wrap">
        <h2 id="give">Give your project a heart</h2>
      </div>
      <p class="note">Add a <code>heart.lock</code> to any repo, in any language. The format is simple, frozen by humans, and readable by every AI.</p>
      <a class="btn-primary" href="https://github.com/abhinav-official/heart/blob/main/README.md">Read the README</a>
      <p class="note spec-link">Or start with the <a href="https://github.com/abhinav-official/heart/blob/main/SPEC.md">SPEC.md</a>.</p>
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
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: false,
        slidesPerView: 1,
        spaceBetween: 24,
        speed: reduce ? 0 : 700,
        loop: true,
        autoplay: reduce ? false : { delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true },
        coverflowEffect: { rotate: 0, stretch: 0, depth: 80, modifier: 1, slideShadows: false },
        pagination: { el: '.maker-pagination', clickable: true },
        navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' },
        keyboard: { enabled: true },
        a11y: { enabled: true },
        breakpoints: {
          720: { slidesPerView: 1.45, spaceBetween: 24 },
          1024: { slidesPerView: 1.85, spaceBetween: 28 }
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
