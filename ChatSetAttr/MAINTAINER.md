# ChatSetAttr — Maintainer Guide

This document is for developers working on the ChatSetAttr Roll20 API script. User-facing documentation lives in the generated [`README.md`](README.md) and in-game via `!setattr-help`.

## Prerequisites

- Node.js 18 or newer
- npm (used below; `pnpm` and `yarn` work equivalently if you prefer)

Install dependencies from the project root:

```bash
npm install
```

ChatSetAttr depends on two sibling packages that must be present in the Roll20 game at runtime:

- **libSmartAttributes**
- **libUUID**

These are linked as dev dependencies for local development and testing.

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | TypeScript source (modules, templates, tests) |
| `docs/help/content.json` | Single source of truth for user documentation |
| `scripts/generate-docs.ts` | Regenerates README, script description, and content revision |
| `script.json` | Roll20 One-Click metadata (version, description, options) |
| `rollup.config.ts` | Bundles `src/index.ts` into deployable `.js` files |

Source is written in TypeScript with JSX-style templates (`h()` helper) for HTML chat and handout output. Rollup produces an IIFE bundle named `ChatSetAttr.js`, plus a copy under `<version>/ChatSetAttr.js` (for example `2.0/ChatSetAttr.js`).

## Typical workflow

A normal change goes through these phases in order.

### 1. Edit source

Implement changes under `src/`. Add or update unit tests under `src/__tests__/`.

### 2. Lint

```bash
npm run lint
```

Auto-fix where possible:

```bash
npm run lint:fix
```

### 3. Test

Run the full suite once (CI-style):

```bash
npm run test:run
```

During development, use watch mode:

```bash
npm test
# or
npm run test:watch
```

### 4. Coverage (optional but recommended before larger changes)

```bash
npm run test:coverage
```

This prints a summary table and writes an HTML report to `coverage/index.html`.

### 5. Documentation

User docs are **not** edited in README or `script.json` directly.

1. Edit [`docs/help/content.json`](docs/help/content.json) only.
2. See [`docs/help/README.md`](docs/help/README.md) for block types and inline markup rules.
3. Regenerate derived files:

   ```bash
   npm run docs:generate
   ```

   This updates:

   - `README.md`
   - `script.json` → `description`
   - `docs/help/content.revision.json` (content hash + `updatedAt` timestamp; bumps only when `content.json` changes)

4. Verify nothing is stale:

   ```bash
   npm run docs:check
   ```

At runtime, if a player has already created the help handout (`!setattr-help`), the script auto-refreshes it on API startup when the bundled revision is newer than `state.ChatSetAttr.helpContentUpdatedAt`.

### 6. Build

Produce the Roll20-ready bundle:

```bash
npm run build
```

Output:

- `ChatSetAttr.js` — latest build at repo root
- `<version>/ChatSetAttr.js` — versioned copy (version comes from `script.json`)

For continuous rebuilds while editing:

```bash
npm start
```

### Pre-release checklist

Before publishing a new build to Roll20:

1. `npm run lint`
2. `npm run test:run`
3. `npm run docs:check` (run `npm run docs:generate` first if docs changed)
4. `npm run build`
5. Confirm `script.json` `version` matches the intended release
6. Upload the appropriate `ChatSetAttr.js` (or update the One-Click script source)

## Adding a new script version

Version migrations run automatically on API `ready` via [`src/modules/versioning.ts`](src/modules/versioning.ts). Each migration is a `VersionObject` with:

- `appliesTo` — comparison against the stored version (e.g. `"<=1.10"`, `"<2.0"`)
- `version` — version string written to state after the migration runs
- `update` — function that performs one-time upgrade work (state changes, notifications, etc.)

To add a new version (for example 2.1):

1. **Bump `script.json`** — set `"version"` to the new release string.

2. **Create a version module** — add `src/versions/2.1.0.ts` exporting a `VersionObject`. Follow the pattern in [`src/versions/2.0.0.ts`](src/versions/2.0.0.ts): migrate `state.ChatSetAttr` as needed and optionally notify GMs.

3. **Create an update message template** (optional) — add `src/templates/versions/2.1.0.tsx` for the in-game changelog HTML, similar to [`src/templates/versions/2.0.0.tsx`](src/templates/versions/2.0.0.tsx).

4. **Register the migration** — import the new object and append it to `VERSION_HISTORY` in `src/modules/versioning.ts`. Order matters: migrations are evaluated sequentially.

5. **Update default config** if new options are added — extend `DEFAULT_CONFIG` and `GLOBAL_CONFIG_OPTIONS` in [`src/modules/config.ts`](src/modules/config.ts), and add matching `useroptions` entries in `script.json` when appropriate.

6. **Add tests** — cover migration logic and any new config flags in `src/__tests__/unit/`.

7. **Update user docs** — edit `docs/help/content.json`, then `npm run docs:generate`.

8. **Build and verify** — `npm run test:run && npm run build`.

On first load after upgrade, campaigns whose `state.ChatSetAttr.version` satisfies `appliesTo` will run the migration once and advance the stored version.

## Configuration and state

Runtime settings persist in `state.ChatSetAttr`. Global One-Click checkboxes sync through `checkGlobalConfig()` on startup. See `src/modules/config.ts` for the full schema.

Flags such as `welcome` (first-run message) and `helpContentUpdatedAt` (last applied help revision) also live in state and should be considered when writing migrations or tests.

## Package manager notes

All scripts above use `npm run <script>`. Equivalent commands:

| npm | pnpm |
|-----|------|
| `npm install` | `pnpm install` |
| `npm run test:run` | `pnpm test:run` |
| `npm run docs:generate` | `pnpm docs:generate` |
| `npm run build` | `pnpm build` |

Lockfiles may differ by tool; use whichever your environment standardizes on, but keep script names consistent with `package.json`.
