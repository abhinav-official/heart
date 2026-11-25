import { existsSync } from "node:fs";
import path from "node:path";
import { createPrompter, heartPath, writeHeartFile } from "../common.js";

export async function runInit(_args: string[]): Promise<number> {
  const dir = process.cwd();
  const filePath = heartPath(dir);
  if (existsSync(filePath)) {
    process.stderr.write(`heart.json already exists at ${filePath}\n`);
    return 1;
  }

  const prompter = createPrompter();
  try {
    const what = await prompter.askNonEmpty("What is this project? ");
    const why = await prompter.askNonEmpty("Why does it exist? ");
    const whom = await prompter.askNonEmpty("Whom is it for? ");

    const now = new Date().toISOString();
    const heart = {
      what,
      why,
      whom,
      frozen_at: now,
      freezes: [
        {
          at: now,
          why,
          note: "First freeze.",
        },
      ],
    };

    writeHeartFile(filePath, heart);
    process.stdout.write(`what: ${what}\n`);
    process.stdout.write(`why: ${why}\n`);
    process.stdout.write(`whom: ${whom}\n`);
    process.stdout.write(`Wrote ${filePath}\n`);
    return 0;
  } finally {
    prompter.close();
  }
}
