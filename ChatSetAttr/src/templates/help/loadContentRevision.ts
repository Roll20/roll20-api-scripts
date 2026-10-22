import contentRevision from "../../../docs/help/content.revision.json";

export type HelpContentRevision = {
  contentHash: string;
  updatedAt: number;
};

const revision = contentRevision as HelpContentRevision;

export function getBundledHelpContentUpdatedAt(): number {
  return revision.updatedAt;
}

export function getBundledHelpContentHash(): string {
  return revision.contentHash;
}
