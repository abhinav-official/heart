import { createPrompter, heartPath, readHeartFile, writeHeartFile } from "../common.js";

export async function runFreeze(_args: string[]): Promise<number> {
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

  const { heart, raw } = result;
  process.stdout.write(`Current why: ${heart.why}\n`);

  const prompter = createPrompter();
  try {
    const newWhy = await prompter.askNonEmpty("New why (one line): ");
    const note = await prompter.askNonEmpty("Why did it change? (one line): ");
    process.stdout.write(`New why: ${newWhy}\n`);
    const confirm = (await prompter.ask("Freeze it? (y/n) ")).trim().toLowerCase();

    if (confirm !== "y" && confirm !== "yes") {
      process.stdout.write("No changes made.\n");
      return 0;
    }

    const now = new Date().toISOString();
    const next = {
      ...raw,
      why: newWhy,
      frozen_at: now,
      freezes: [...heart.freezes, { at: now, why: newWhy, note }],
    };
    writeHeartFile(filePath, next);
    process.stdout.write(`Frozen. Wrote ${filePath}\n`);
    return 0;
  } finally {
    prompter.close();
  }
}
