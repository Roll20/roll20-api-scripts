import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export function hashHelpContentFile(filePath: string): string {
  const bytes = readFileSync(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}
