import path from "node:path";
import { daysSince, formatDate, readHeartFile } from "../common.js";

export async function runCheck(args: string[]): Promise<number> {
  const target = args[0]
    ? path.resolve(process.cwd(), args[0])
    : path.join(process.cwd(), "heart.json");

  const result = readHeartFile(target);
  if (!result.ok) {
    if (result.error === "No heart found.") {
      process.stderr.write("No heart found.\n");
    } else {
      process.stderr.write(`${result.error}\n`);
    }
    return 1;
  }

  const { heart } = result;
  const last = heart.freezes[heart.freezes.length - 1];
  const lastDate = formatDate(last.at);
  const days = daysSince(last.at);

  process.stdout.write(`what: ${heart.what}\n`);
  process.stdout.write(`why: ${heart.why}\n`);
  process.stdout.write(`whom: ${heart.whom}\n`);
  process.stdout.write(`last freeze: ${lastDate}\n`);
  process.stdout.write(`days since last freeze: ${days}\n`);
  return 0;
}
