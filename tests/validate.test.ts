import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validate } from "../src/validate.js";

function loadFixture(name: string): unknown {
  const url = new URL(`../../tests/fixtures/${name}`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as unknown;
}

test("valid fixture passes", () => {
  const problems = validate(loadFixture("valid.json"));
  assert.deepEqual(problems, []);
});

test("missing field fails with the right problem", () => {
  const problems = validate(loadFixture("missing-field.json"));
  assert.ok(
    problems.includes("missing required field: whom"),
    `expected missing-field problem, got: ${problems.join("; ")}`,
  );
});

test("empty why fails with the right problem", () => {
  const problems = validate(loadFixture("empty-why.json"));
  assert.ok(
    problems.includes("why must be non-empty"),
    `expected empty-why problem, got: ${problems.join("; ")}`,
  );
});

test("multi-line what fails with the right problem", () => {
  const problems = validate(loadFixture("multi-line-what.json"));
  assert.ok(
    problems.includes("what must be a single line"),
    `expected multi-line-what problem, got: ${problems.join("; ")}`,
  );
});

test("top-level why not matching last freeze fails with the right problem", () => {
  const problems = validate(loadFixture("why-mismatch.json"));
  assert.ok(
    problems.includes("why must equal the last freeze's why"),
    `expected why-mismatch problem, got: ${problems.join("; ")}`,
  );
});

test("validator accepts a heart with and without the ai block", () => {
  const base = loadFixture("valid.json") as Record<string, unknown>;
  assert.deepEqual(validate(base), []);
  const withAi = {
    ...base,
    ai: {
      edit_permission: "denied",
      reason: "Locked.",
      instruction: "Read first.",
    },
  };
  assert.deepEqual(validate(withAi), []);
});

test("an ai block with edit_permission set to anything else fails validation", () => {
  const base = loadFixture("valid.json") as Record<string, unknown>;
  const problems = validate({
    ...base,
    ai: {
      edit_permission: "allowed",
      reason: "Locked.",
      instruction: "Read first.",
    },
  });
  assert.ok(
    problems.includes('ai.edit_permission must be "denied"'),
    `expected ai.edit_permission problem, got: ${problems.join("; ")}`,
  );
});
