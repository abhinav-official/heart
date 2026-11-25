#!/usr/bin/env node
import { runInit } from "./commands/init.js";
import { runCheck } from "./commands/check.js";
import { runFreeze } from "./commands/freeze.js";
import { runCard } from "./commands/card.js";

const USAGE = `Usage: heart <command> [options]

Commands:
  init              Create heart.lock in the current directory
  check [path]      Validate heart.lock (or a specific file)
  freeze            Append a new freeze to heart.lock
  card [--out dir]  Write heart-card.svg and heart-card.html

Options:
  -h, --help        Show this help
`;

export async function main(argv: string[]): Promise<number> {
  const args = argv.slice(2);
  if (args.length === 0) {
    process.stderr.write(USAGE);
    return 1;
  }

  const [command, ...rest] = args;
  if (command === "--help" || command === "-h") {
    process.stdout.write(USAGE);
    return 0;
  }

  switch (command) {
    case "init":
      return runInit(rest);
    case "check":
      return runCheck(rest);
    case "freeze":
      return runFreeze(rest);
    case "card":
      return runCard(rest);
    default:
      process.stderr.write(`Unknown command: ${command}\n\n${USAGE}`);
      return 1;
  }
}

main(process.argv).then(
  (code) => {
    process.exitCode = code;
  },
  (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  },
);
