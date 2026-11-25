import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { validate } from "../src/validate.js";
import { CANONICAL_AI } from "../src/common.js";

const CLI = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../cli.js");

function runCli(args: string[], options: { cwd: string; input?: string }) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: options.cwd,
    input: options.input ?? "",
    encoding: "utf8",
    env: { ...process.env },
  });
}

function makeTempDir(): string {
  return mkdtempSync(path.join(os.tmpdir(), "heart-test-"));
}

test("init creates a valid heart.lock from piped answers and refuses a second init", () => {
  const dir = makeTempDir();
  try {
    const first = runCli(["init"], {
      cwd: dir,
      input: "My project\nBecause it matters\nBuilders\n",
    });
    assert.equal(first.status, 0, first.stderr || first.stdout);
    const heartPath = path.join(dir, "heart.lock");
    assert.ok(existsSync(heartPath));
    const heart = JSON.parse(readFileSync(heartPath, "utf8")) as unknown;
    assert.deepEqual(validate(heart), []);
    const obj = heart as { ai: unknown; what: string; why: string; whom: string; freezes: unknown[] };
    assert.deepEqual(obj.ai, CANONICAL_AI);
    assert.equal(obj.what, "My project");
    assert.equal(obj.why, "Because it matters");
    assert.equal(obj.whom, "Builders");
    assert.equal(obj.freezes.length, 1);

    const second = runCli(["init"], {
      cwd: dir,
      input: "A\nB\nC\n",
    });
    assert.equal(second.status, 1);
    assert.match(second.stderr + second.stdout, /already exists/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check exits 0 on a valid heart and 1 on missing and on invalid", () => {
  const dir = makeTempDir();
  try {
    const missing = runCli(["check"], { cwd: dir });
    assert.equal(missing.status, 1);
    assert.match(missing.stderr + missing.stdout, /No heart found/);

    const validHeart = {
      what: "A project",
      why: "A reason",
      whom: "People",
      frozen_at: "2026-11-25T12:00:00Z",
      freezes: [{ at: "2026-11-25T12:00:00Z", why: "A reason", note: "First freeze." }],
    };
    writeFileSync(path.join(dir, "heart.lock"), JSON.stringify(validHeart, null, 2) + "\n", "utf8");
    const valid = runCli(["check"], { cwd: dir });
    assert.equal(valid.status, 0, valid.stderr || valid.stdout);
    assert.match(valid.stdout, /what: A project/);
    assert.match(valid.stdout, /why: A reason/);
    assert.match(valid.stdout, /whom: People/);
    assert.match(valid.stdout, /last freeze: 2026-11-25/);

    const badDir = makeTempDir();
    try {
      writeFileSync(
        path.join(badDir, "heart.lock"),
        JSON.stringify({ what: "x" }, null, 2) + "\n",
        "utf8",
      );
      const invalid = runCli(["check"], { cwd: badDir });
      assert.equal(invalid.status, 1);
      assert.match(invalid.stderr + invalid.stdout, /missing required field/);
    } finally {
      rmSync(badDir, { recursive: true, force: true });
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("freeze appends a freeze, updates why and frozen_at, and leaves the earlier history untouched", () => {
  const dir = makeTempDir();
  try {
    const initial = {
      what: "A project",
      why: "Old why",
      whom: "People",
      frozen_at: "2026-11-20T12:00:00Z",
      freezes: [{ at: "2026-11-20T12:00:00Z", why: "Old why", note: "First freeze." }],
      extra: "preserved",
    };
    writeFileSync(path.join(dir, "heart.lock"), JSON.stringify(initial, null, 2) + "\n", "utf8");

    const result = runCli(["freeze"], {
      cwd: dir,
      input: "New why\nBecause things changed\ny\n",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const updated = JSON.parse(readFileSync(path.join(dir, "heart.lock"), "utf8")) as {
      ai: unknown;
      why: string;
      frozen_at: string;
      freezes: Array<{ at: string; why: string; note: string }>;
      extra: string;
    };
    assert.deepEqual(updated.ai, CANONICAL_AI);
    assert.equal(updated.why, "New why");
    assert.equal(updated.extra, "preserved");
    assert.equal(updated.freezes.length, 2);
    assert.deepEqual(updated.freezes[0], {
      at: "2026-11-20T12:00:00Z",
      why: "Old why",
      note: "First freeze.",
    });
    assert.equal(updated.freezes[1].why, "New why");
    assert.equal(updated.freezes[1].note, "Because things changed");
    assert.equal(updated.frozen_at, updated.freezes[1].at);
    assert.notEqual(updated.frozen_at, "2026-11-20T12:00:00Z");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("freeze preserves an existing ai block exactly", () => {
  const dir = makeTempDir();
  try {
    const customAi = {
      edit_permission: "denied",
      reason: "Custom reason.",
      instruction: "Custom instruction.",
    };
    const initial = {
      what: "A project",
      why: "Old why",
      whom: "People",
      frozen_at: "2026-11-20T12:00:00Z",
      freezes: [{ at: "2026-11-20T12:00:00Z", why: "Old why", note: "First freeze." }],
      ai: customAi,
    };
    writeFileSync(path.join(dir, "heart.lock"), JSON.stringify(initial, null, 2) + "\n", "utf8");

    const result = runCli(["freeze"], {
      cwd: dir,
      input: "New why\nBecause things changed\ny\n",
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const updated = JSON.parse(readFileSync(path.join(dir, "heart.lock"), "utf8")) as { ai: unknown };
    assert.deepEqual(updated.ai, customAi);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("card writes both files and the SVG contains the why text", () => {
  const dir = makeTempDir();
  try {
    const heart = {
      what: "A project",
      why: "A reason worth keeping",
      whom: "People",
      frozen_at: "2026-11-25T12:00:00Z",
      freezes: [{ at: "2026-11-25T12:00:00Z", why: "A reason worth keeping", note: "First freeze." }],
    };
    writeFileSync(path.join(dir, "heart.lock"), JSON.stringify(heart, null, 2) + "\n", "utf8");

    const result = runCli(["card"], { cwd: dir });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const svgPath = path.join(dir, "heart-card.svg");
    const htmlPath = path.join(dir, "heart-card.html");
    assert.ok(existsSync(svgPath));
    assert.ok(existsSync(htmlPath));
    const svg = readFileSync(svgPath, "utf8");
    const html = readFileSync(htmlPath, "utf8");
    assert.match(svg, /A reason worth keeping/);
    assert.match(svg, /WHAT/);
    assert.match(svg, /WHY/);
    assert.match(svg, /WHOM/);
    assert.match(svg, /Last frozen 2026-11-25/);
    assert.match(svg, /heart\.lock/);
    assert.match(html, /<svg/);
    assert.match(html, /A reason worth keeping/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
