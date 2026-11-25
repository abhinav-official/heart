import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseDriftVerdict } from "../src/commands/drift.js";

const CLI = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../cli.js");

function makeTempDir(): string {
  return mkdtempSync(path.join(os.tmpdir(), "heart-drift-"));
}

test("parseDriftVerdict accepts a clean ALIGNED reply", () => {
  const result = parseDriftVerdict("ALIGNED\nThe work serves the frozen why.\n");
  assert.deepEqual(result, {
    ok: true,
    verdict: "ALIGNED",
    reason: "The work serves the frozen why.",
  });
});

test("parseDriftVerdict accepts a clean DRIFT reply", () => {
  const result = parseDriftVerdict("DRIFT\nThis work does not serve the frozen why.\n");
  assert.deepEqual(result, {
    ok: true,
    verdict: "DRIFT",
    reason: "This work does not serve the frozen why.",
  });
});

test("parseDriftVerdict rejects a malformed reply", () => {
  const result = parseDriftVerdict("MAYBE\nNot sure.\n");
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.raw, "MAYBE\nNot sure.\n");
});

test("drift exits 2 with guidance when HEART_LLM_API_KEY is not set", () => {
  const dir = makeTempDir();
  try {
    const heart = {
      what: "A project",
      why: "A reason",
      whom: "People",
      frozen_at: "2026-11-25T12:00:00Z",
      freezes: [{ at: "2026-11-25T12:00:00Z", why: "A reason", note: "First freeze." }],
      ai: {
        edit_permission: "denied",
        reason: "Locked.",
        instruction: "Read first.",
      },
    };
    writeFileSync(path.join(dir, "heart.lock"), JSON.stringify(heart, null, 2) + "\n", "utf8");
    writeFileSync(path.join(dir, "plan.md"), "Do something.\n", "utf8");

    const env = { ...process.env };
    delete env.HEART_LLM_API_KEY;
    const result = spawnSync(process.execPath, [CLI, "drift", "plan.md"], {
      cwd: dir,
      encoding: "utf8",
      env,
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr + result.stdout, /HEART_LLM_API_KEY/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
