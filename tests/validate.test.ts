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
