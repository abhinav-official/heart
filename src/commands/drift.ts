import { readFileSync } from "node:fs";
import path from "node:path";
import { heartPath, readHeartFile } from "../common.js";

export type DriftVerdict =
  | { ok: true; verdict: "DRIFT" | "ALIGNED"; reason: string }
  | { ok: false; raw: string };

export function parseDriftVerdict(reply: string): DriftVerdict {
  const trimmed = reply.trim();
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return { ok: false, raw: reply };
  }
  const first = lines[0];
  const verdict = first === "DRIFT" ? "DRIFT" : first === "ALIGNED" ? "ALIGNED" : null;
  if (!verdict) {
    return { ok: false, raw: reply };
  }
  const reason = lines.slice(1).join(" ").trim();
  if (reason.length === 0) {
    return { ok: false, raw: reply };
  }
  return { ok: true, verdict, reason };
}

export async function runDrift(args: string[]): Promise<number> {
  const target = args[0];
  if (!target) {
    process.stderr.write("Usage: heart drift <path>\n");
    return 2;
  }

  const apiKey = process.env.HEART_LLM_API_KEY;
  if (!apiKey) {
    process.stderr.write("Set HEART_LLM_API_KEY to use heart drift.\n");
    return 2;
  }

  const heartFile = heartPath(process.cwd());
  const heartResult = readHeartFile(heartFile);
  if (!heartResult.ok) {
    if (heartResult.error === "No heart found.") {
      process.stderr.write("No heart found.\n");
    } else {
      process.stderr.write(`Invalid heart.lock:\n${heartResult.error}\n`);
    }
    return 1;
  }

  const filePath = path.resolve(process.cwd(), target);
  let content: string;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    process.stderr.write(`Could not read file: ${filePath}\n`);
    return 1;
  }

  const baseUrl = (process.env.HEART_LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.HEART_LLM_MODEL || "gpt-4o-mini";
  const { heart } = heartResult;

  const prompt = [
    "You are checking whether work serves a project's frozen heart.",
    "",
    "Heart:",
    `what: ${heart.what}`,
    `why: ${heart.why}`,
    `whom: ${heart.whom}`,
    "",
    "File contents:",
    content,
    "",
    "Reply in exactly two lines.",
    "Line 1: DRIFT or ALIGNED",
    "Line 2: one-sentence reason.",
  ].join("\n");

  let reply: string;
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      process.stderr.write(`LLM request failed (${res.status}): ${text}\n`);
      return 2;
    }
    const data = JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    reply = data.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`LLM request failed: ${message}\n`);
    return 2;
  }

  const parsed = parseDriftVerdict(reply);
  if (!parsed.ok) {
    process.stdout.write(reply);
    if (!reply.endsWith("\n")) process.stdout.write("\n");
    return 2;
  }

  process.stdout.write(`${parsed.verdict}\n${parsed.reason}\n`);
  return parsed.verdict === "DRIFT" ? 1 : 0;
}
