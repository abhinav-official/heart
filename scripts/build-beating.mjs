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

function renderMaker(entry) {
  return `          <article class="carousel-card entry">
            <div class="entry-header">
              <h3><a href="${esc(entry.repo)}">${esc(entry.name)}</a></h3>
              <span class="status frozen">frozen by the maker</span>
            </div>
            <dl>
              <div class="row"><dt>What</dt><dd>${esc(entry.what)}</dd></div>
              <div class="row"><dt>Why</dt><dd>${esc(entry.why)}</dd></div>
              <div class="row"><dt>Whom</dt><dd>${esc(entry.whom)}</dd></div>
            </dl>
            <p class="heartbeat">Heartbeat: last frozen ${esc(entry.last_frozen)}</p>
          </article>`;
}

function renderExample(entry) {
  return `        <article class="entry example-entry">
          <div class="entry-header">
            <h3><a href="${esc(entry.repo)}">${esc(entry.name)}</a></h3>
            <span class="status">example</span>
          </div>
          <dl>
            <div class="row"><dt>What</dt><dd>${esc(entry.what)}</dd></div>
            <div class="row"><dt>Why</dt><dd>${esc(entry.why)}</dd></div>
            <div class="row"><dt>Whom</dt><dd>${esc(entry.whom)}</dd></div>
          </dl>
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
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <header class="hero">
      <svg class="glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 20.5C10.2 18.9 4 14 4 9.2C4 6.3 6.2 4 9 4C10.7 4 12.2 4.8 13 6C13.8 4.8 15.3 4 17 4C19.8 4 22 6.3 22 9.2C22 14 15.8 18.9 14 20.5L12 22L10 20.5Z" fill="#b54a4a"/>
      </svg>
      <p class="eyebrow">The heart.lock directory</p>
      <h1>Beating</h1>
      <p class="intro">Projects that carry a heart.lock, and what their hearts say.</p>
    </header>

    <section class="makers" aria-labelledby="frozen">
      <div class="section-head">
        <div>
          <h2 id="frozen">Frozen by the maker</h2>
          <p class="section-note">Real hearts, frozen by the people who build them.</p>
        </div>
        <div class="carousel-controls">
          <button type="button" class="carousel-btn" data-carousel-prev aria-label="Previous project">&#8592;</button>
          <button type="button" class="carousel-btn" data-carousel-next aria-label="Next project">&#8594;</button>
        </div>
      </div>
      <div class="carousel" data-carousel>
        <div class="carousel-track" data-carousel-track tabindex="0" aria-label="Maker projects">
${makers.map(renderMaker).join("\n\n")}
        </div>
        <div class="carousel-dots" data-carousel-dots aria-label="Carousel position"></div>
      </div>
    </section>

    <section class="examples-band" aria-labelledby="examples">
      <div class="examples-inner">
        <h2 id="examples">Examples</h2>
        <p class="note">These are example hearts, written in the same format to show what a heart.lock could say. Each is clearly marked <strong>example</strong> until its makers freeze a real one.</p>
        <div class="examples-grid">
${examples.map(renderExample).join("\n\n")}
        </div>
      </div>
    </section>

    <section class="cta-section" aria-labelledby="claim">
      <h2 id="claim">Claim your listing</h2>
      <p class="note">1. Add a <code>heart.lock</code> to your repo and freeze it.</p>
      <p class="note">2. Open a pull request against the <a href="https://github.com/abhinav-official/heart">heartlock repo</a> adding your entry to <code>site/beating.json</code>.</p>
      <p class="note">3. Your entry is verified against the <code>heart.lock</code> in your repo before it merges.</p>
      <p class="note">4. Once merged and deployed, you are listed as <strong>frozen by the maker</strong>.</p>
      <p class="note">Claiming an example works the same way: the PR changes that entry's status to <code>maker</code> with the true freeze date.</p>
    </section>

    <section class="cta-section give" aria-labelledby="give">
      <h2 id="give">Give your project a heart</h2>
      <p class="note">Add a <code>heart.lock</code> to any repo, in any language. The format is simple, frozen by humans, and readable by every AI.</p>
      <a class="btn-red" href="https://github.com/abhinav-official/heart/blob/main/README.md">Read the README</a>
      <p class="note spec-link">Or start with the <a href="https://github.com/abhinav-official/heart/blob/main/SPEC.md">SPEC.md</a>.</p>
    </section>

    <footer>
      <p>Beating is part of <a href="https://github.com/abhinav-official/heart">heartlock</a>.</p>
    </footer>
  </main>
  <script src="carousel.js"></script>
</body>
</html>
`;

writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${entries.length} entries)`);
