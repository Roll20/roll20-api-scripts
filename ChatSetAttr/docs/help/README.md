# ChatSetAttr Help Content

The file [`content.json`](content.json) is the single source of truth for ChatSetAttr user documentation.

It is rendered to:

- Roll20 help handout HTML (runtime, via `createHelpHandout`)
- [`README.md`](../../README.md) (GitHub, via `pnpm docs:generate`)
- [`script.json`](../../script.json) `description` (Roll20 One-Click page, via `pnpm docs:generate`)

## Editing

1. Edit `content.json` only — do not edit README or script description by hand.
2. Validate structure against [`content.schema.json`](content.schema.json) (VS Code will autocomplete if `$schema` is set).
3. Run `pnpm docs:generate` to regenerate README and script.json.
4. Run `pnpm docs:check` before committing to ensure generated files are in sync.

## Document structure

```json
{
  "title": "ChatSetAttr",
  "introduction": "Opening paragraph...",
  "sections": [
    {
      "id": "basic-usage",
      "title": "Basic Usage",
      "blocks": [ ... ],
      "subsections": [
        { "id": "setattr", "title": "!setattr", "blocks": [ ... ] }
      ]
    }
  ]
}
```

- **sections** — top-level `h2` topics. Each needs a unique `id` (kebab-case slug used for anchors).
- **subsections** — optional `h3` topics under a section.
- **blocks** — content within a section or subsection.

Table of Contents is generated automatically from section titles — do not add a TOC block.

## Block types

| Type | Purpose |
|------|---------|
| `paragraph` | Prose, labels like **Example:** |
| `codeBlock` | Command or macro examples (`lines` array) |
| `unorderedList` | Bullet list |
| `orderedList` | Numbered list; items may include nested `codeBlock` |
| `note` | Callout / warning (`emphasis: true` for emphasized notes) |

## Inline markup

Within `paragraph.text`, `unorderedList.items`, `orderedList.items[].text`, and `note.text`, use a small markdown subset:

- `**bold text**`
- `` `inline code` ``

Write special characters literally in JSON (`<`, `>`, `{`, `}`, `&`). Renderers escape them per output format.

## Code blocks

Use `lines` for readability:

```json
{
  "type": "codeBlock",
  "lines": [
    "!setattr --sel --hp|25|50"
  ]
}
```

Multi-line commands use multiple array entries or embedded `\n` in a single line.
