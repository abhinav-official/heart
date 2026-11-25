import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { formatDate, heartPath, readHeartFile } from "../common.js";
import type { Heart } from "../validate.js";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= max) {
      current = next;
    } else {
      if (current) lines.push(current);
      if (word.length > max) {
        for (let i = 0; i < word.length; i += max) lines.push(word.slice(i, i + max));
        current = "";
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function heartGlyph(x: number, y: number, scale: number): string {
  // Simple heart path centered roughly at origin, scaled and translated.
  const d =
    "M 0 -0.35 C -0.1 -0.55 -0.5 -0.55 -0.5 -0.2 C -0.5 0.1 -0.2 0.35 0 0.55 C 0.2 0.35 0.5 0.1 0.5 -0.2 C 0.5 -0.55 0.1 -0.55 0 -0.35 Z";
  return `<path d="${d}" fill="#e25555" transform="translate(${x} ${y}) scale(${scale})"/>`;
}

function renderSvg(heart: Heart): string {
  const last = heart.freezes[heart.freezes.length - 1];
  const lastDate = formatDate(last.at);
  const sections: Array<{ label: string; value: string }> = [
    { label: "WHAT", value: heart.what },
    { label: "WHY", value: heart.why },
    { label: "WHOM", value: heart.whom },
  ];

  let y = 120;
  const content: string[] = [];
  for (const section of sections) {
    content.push(
      `<text x="80" y="${y}" font-size="20" font-family="Georgia, serif" fill="#e25555" letter-spacing="2">${section.label}</text>`,
    );
    y += 36;
    const lines = wrapText(section.value, 52);
    for (const line of lines) {
      content.push(
        `<text x="80" y="${y}" font-size="34" font-family="Georgia, serif" fill="#1f2937">${escapeXml(line)}</text>`,
      );
      y += 44;
    }
    y += 24;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Heart card">
  <rect width="1200" height="630" fill="#fffaf8"/>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#f0d7d7" stroke-width="2"/>
  ${heartGlyph(1100, 80, 70)}
  ${content.join("\n  ")}
  <text x="80" y="560" font-size="22" font-family="Georgia, serif" fill="#6b7280">Last frozen ${escapeXml(lastDate)}</text>
  <text x="1120" y="560" text-anchor="end" font-size="20" font-family="Georgia, serif" fill="#9ca3af">heart.json</text>
</svg>
`;
}

function renderHtml(heart: Heart, svg: string): string {
  const last = heart.freezes[heart.freezes.length - 1];
  const lastDate = formatDate(last.at);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Heart Card</title>
  <style>
    body { margin: 0; padding: 24px; font-family: Georgia, serif; background: #fffaf8; color: #1f2937; }
    main { max-width: 1200px; margin: 0 auto; }
    .card { width: 100%; height: auto; display: block; border: 1px solid #f0d7d7; }
    .text { margin-top: 24px; padding: 0 8px; }
    .text h2 { margin: 24px 0 4px; font-size: 14px; letter-spacing: 2px; color: #e25555; }
    .text p { margin: 0; font-size: 28px; line-height: 1.3; }
    .meta { margin-top: 24px; color: #6b7280; font-size: 16px; }
  </style>
</head>
<body>
  <main>
    ${svg}
    <section class="text" aria-label="Heart text">
      <h2>WHAT</h2>
      <p>${escapeHtml(heart.what)}</p>
      <h2>WHY</h2>
      <p>${escapeHtml(heart.why)}</p>
      <h2>WHOM</h2>
      <p>${escapeHtml(heart.whom)}</p>
      <p class="meta">Last frozen ${escapeHtml(lastDate)}</p>
    </section>
  </main>
</body>
</html>
`;
}

export async function runCard(args: string[]): Promise<number> {
  let outDir = process.cwd();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out") {
      const value = args[i + 1];
      if (!value) {
        process.stderr.write("Missing value for --out\n");
        return 1;
      }
      outDir = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      process.stderr.write(`Unknown option: ${arg}\n`);
      return 1;
    }
  }

  const filePath = heartPath(process.cwd());
  const result = readHeartFile(filePath);
  if (!result.ok) {
    if (result.error === "No heart found.") {
      process.stderr.write("No heart found.\n");
    } else {
      process.stderr.write(`Invalid heart.json:\n${result.error}\n`);
    }
    return 1;
  }

  mkdirSync(outDir, { recursive: true });
  const svg = renderSvg(result.heart);
  const html = renderHtml(result.heart, svg);
  const svgPath = path.join(outDir, "heart-card.svg");
  const htmlPath = path.join(outDir, "heart-card.html");
  writeFileSync(svgPath, svg, "utf8");
  writeFileSync(htmlPath, html, "utf8");
  process.stdout.write(`${svgPath}\n`);
  process.stdout.write(`${htmlPath}\n`);
  return 0;
}
