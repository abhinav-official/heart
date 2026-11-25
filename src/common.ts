import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { validate, type Heart } from "./validate.js";

export const CANONICAL_AI = {
  edit_permission: "denied" as const,
  reason:
    "This file is the project's frozen heart: what it is, why it exists, and whom it is for. Only a human may change it, by hand, through a freeze (heart freeze).",
  instruction:
    "Read the what, why and whom above before working on this project. If the work in front of you does not serve the why, say so before doing it.",
};

export function heartPath(dir: string): string {
  return path.join(dir, "heart.lock");
}

export function readHeartFile(
  filePath: string,
): { ok: true; heart: Heart; raw: Record<string, unknown> } | { ok: false; error: string } {
  let text: string;
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return { ok: false, error: "No heart found." };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "heart.lock is not valid JSON." };
  }
  const problems = validate(parsed);
  if (problems.length > 0) {
    return { ok: false, error: problems.join("\n") };
  }
  return { ok: true, heart: parsed as Heart, raw: parsed as Record<string, unknown> };
}

export function writeHeartFile(filePath: string, heart: Record<string, unknown>): void {
  writeFileSync(filePath, JSON.stringify(heart, null, 2) + "\n", "utf8");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

export function daysSince(iso: string, now: Date = new Date()): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  const diff = now.getTime() - then;
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

export interface Prompter {
  ask(question: string): Promise<string | null>;
  askNonEmpty(question: string): Promise<string | null>;
  close(): void;
}

export function createPrompter(
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
): Prompter {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const lines: string[] = [];
  let waiting: ((line: string | null) => void) | null = null;
  let ended = false;

  rl.on("line", (line) => {
    if (waiting) {
      const resolve = waiting;
      waiting = null;
      resolve(line);
    } else {
      lines.push(line);
    }
  });
  rl.on("close", () => {
    ended = true;
    if (waiting) {
      const resolve = waiting;
      waiting = null;
      resolve(null);
    }
  });

  function nextLine(): Promise<string | null> {
    if (lines.length > 0) return Promise.resolve(lines.shift() as string);
    if (ended) return Promise.resolve(null);
    return new Promise((resolve) => {
      waiting = resolve;
    });
  }

  async function ask(question: string): Promise<string | null> {
    output.write(question);
    return nextLine();
  }

  async function askNonEmpty(question: string): Promise<string | null> {
    for (;;) {
      const answer = await ask(question);
      if (answer === null) return null;
      const trimmed = answer.trim();
      if (trimmed.length === 0) {
        output.write("Answer must be a non-empty single line.\n");
        continue;
      }
      return trimmed;
    }
  }

  return { ask, askNonEmpty, close: () => rl.close() };
}
