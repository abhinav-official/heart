import { CANONICAL_AI, createPrompter, heartPath, readHeartFile, writeHeartFile } from "../common.js";

export async function runFreeze(_args: string[]): Promise<number> {
  const filePath = heartPath(process.cwd());
  const result = readHeartFile(filePath);
  if (!result.ok) {
    if (result.error === "No heart found.") {
      process.stderr.write("No heart found.\n");
    } else {
      process.stderr.write(`Invalid heart.lock:\n${result.error}\n`);
    }
    return 1;
  }

  const { heart, raw } = result;
  process.stdout.write(`Current why: ${heart.why}\n`);

  const prompter = createPrompter();
  try {
    const newWhy = await prompter.askNonEmpty("New why (one line): ");
    if (newWhy === null) {
      process.stderr.write("Freeze stopped: no input. Nothing was written.\n");
      return 1;
    }
    const note = await prompter.askNonEmpty("Why did it change? (one line): ");
    if (note === null) {
      process.stderr.write("Freeze stopped: no input. Nothing was written.\n");
      return 1;
    }
    process.stdout.write(`New why: ${newWhy}\n`);
    const confirmAnswer = await prompter.ask("Freeze it? (y/n) ");
    if (confirmAnswer === null) {
      process.stderr.write("Freeze stopped: no input. Nothing was written.\n");
      return 1;
    }
    const confirm = confirmAnswer.trim().toLowerCase();

    if (confirm !== "y" && confirm !== "yes") {
      process.stdout.write("No changes made.\n");
      return 0;
    }

    const now = new Date().toISOString();
    const { ai: existingAi, comment: _legacyComment, ...rest } = raw;
    const ai =
      typeof existingAi === "object" && existingAi !== null && !Array.isArray(existingAi)
        ? (existingAi as Record<string, unknown>)
        : CANONICAL_AI;
    const next = {
      ...rest,
      why: newWhy,
      frozen_at: now,
      freezes: [...heart.freezes, { at: now, why: newWhy, note }],
      ai,
    };
    writeHeartFile(filePath, next);
    process.stdout.write(`Frozen. Wrote ${filePath}\n`);
    return 0;
  } finally {
    prompter.close();
  }
}
