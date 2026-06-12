import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import helpContent from "../docs/help/content.json" with { type: "json" };
import { hashHelpContentFile } from "../src/templates/help/contentHash.ts";
import { renderHelpMarkdown } from "../src/templates/help/renderMarkdown.ts";
import type { HelpContentRevision } from "../src/templates/help/loadContentRevision.ts";
import type { HelpDocument } from "../src/templates/help/types.ts";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readmePath = join(rootDir, "README.md");
const scriptJsonPath = join(rootDir, "script.json");
const contentPath = join(rootDir, "docs/help/content.json");
const revisionPath = join(rootDir, "docs/help/content.revision.json");

const README_HEADER = "<!-- Generated from docs/help/content.json. Run pnpm docs:generate -->\n\n";

function loadDocument(): HelpDocument {
  return helpContent as HelpDocument;
}

function buildReadme(doc: HelpDocument): string {
  return README_HEADER + renderHelpMarkdown(doc, { includeToc: true });
}

function buildScriptDescription(doc: HelpDocument): string {
  return renderHelpMarkdown(doc, { includeToc: false }).trim();
}

function readScriptJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(scriptJsonPath, "utf8")) as Record<string, unknown>;
}

function writeScriptJson(scriptJson: Record<string, unknown>, description: string): void {
  scriptJson.description = description;
  writeFileSync(scriptJsonPath, `${JSON.stringify(scriptJson, null, 4)}\n`, "utf8");
}

function readRevisionFile(): HelpContentRevision | undefined {
  if (!existsSync(revisionPath)) {
    return undefined;
  }
  return JSON.parse(readFileSync(revisionPath, "utf8")) as HelpContentRevision;
}

function buildRevision(contentHash: string): HelpContentRevision {
  const existing = readRevisionFile();
  if (existing?.contentHash === contentHash) {
    return existing;
  }
  return {
    contentHash,
    updatedAt: Date.now(),
  };
}

function writeRevision(revision: HelpContentRevision): void {
  writeFileSync(revisionPath, `${JSON.stringify(revision, null, 2)}\n`, "utf8");
}

function updateRevisionFile(): HelpContentRevision {
  const contentHash = hashHelpContentFile(contentPath);
  const revision = buildRevision(contentHash);
  writeRevision(revision);
  return revision;
}

function generateDocs(): { readme: string; description: string; revision: HelpContentRevision } {
  const doc = loadDocument();
  const readme = buildReadme(doc);
  const description = buildScriptDescription(doc);
  writeFileSync(readmePath, readme, "utf8");
  writeScriptJson(readScriptJson(), description);
  const revision = updateRevisionFile();
  return { readme, description, revision };
}

function checkDocs(): void {
  const existingReadme = readFileSync(readmePath, "utf8");
  const existingScript = readScriptJson();
  const existingDescription = String(existingScript.description ?? "");

  const doc = loadDocument();
  const expectedReadme = buildReadme(doc);
  const expectedDescription = buildScriptDescription(doc);
  const expectedHash = hashHelpContentFile(contentPath);
  const existingRevision = readRevisionFile();

  const errors: string[] = [];
  if (existingReadme !== expectedReadme) {
    errors.push("README.md is out of date (run pnpm docs:generate)");
  }
  if (existingDescription !== expectedDescription) {
    errors.push("script.json description is out of date (run pnpm docs:generate)");
  }
  if (!existingRevision) {
    errors.push("docs/help/content.revision.json is missing (run pnpm docs:generate)");
  } else if (existingRevision.contentHash !== expectedHash) {
    errors.push("docs/help/content.revision.json is out of date (run pnpm docs:generate)");
  }

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log("Documentation is up to date.");
}

const checkMode = process.argv.includes("--check");

if (checkMode) {
  checkDocs();
} else {
  generateDocs();
  console.log("Generated README.md, script.json description, and content.revision.json.");
}
