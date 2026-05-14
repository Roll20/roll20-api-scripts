# Condition Tracker Developer Guide

This guide is for contributors who want to edit source files and regenerate the bundled script used by Roll20.

## What You Need

- Node.js 20.x LTS recommended
- npm
- Git
- A code editor

Check your versions:

```bash
node -v
npm -v
git --version
```

## Project Layout

- `src/` is the source of truth for script logic.
- `src/locales/locale/<locale>.js` contains one translation module per supported locale.
- `src/locales/metadata.js` defines supported locale codes, display names, aliases, direction, flag labels, and source file references.
- `ConditionTracker.js` is generated output.
- `<version>/ConditionTracker.js` is generated output for release/version tracking.
- `script.json` controls script metadata and the versioned output folder name.
- [MOD_FILE_MAP.md](MOD_FILE_MAP.md) is the complete developer inventory of project files and module responsibilities.

Do not hand-edit generated bundle files.

## First-Time Setup

From the `ConditionTracker` directory:

```bash
npm install
```

## Build Commands

One-time build:

```bash
npm run build
```

Watch mode:

```bash
npm run watch
```

The build bundles `src/index.js` and writes both root and versioned output files.

Format source and docs:

```bash
npm run format
```

## Contributor Workflow

1. Edit files in `src/`.
2. Run `npm run format`.
3. Run `npm run build`.
4. Paste `ConditionTracker.js` into Roll20 and restart the sandbox.
5. Run the smoke and regression checks in `TESTING.md`.
6. Commit source, docs, metadata, and generated artifacts together.

## Locale Updates

When adding or editing translations:

1. Update the relevant file under `src/locales/locale/`.
2. Keep translation keys aligned with `src/locales/locale/en-US.js`, which is the fallback when a key is missing.
3. For incorrect translated output, edit the matching section:
   - `conditions`, `condNames`, and `templates` for Turn Tracker text and apply/remove announcements.
   - `ui` for chat cards, menus, buttons, warnings, config, and help messages.
   - `handout` for the generated help handout and help-card tables that reuse handout content.
   - `languageNames` for the available-translations list when that locale is active.
4. Update `src/locales/metadata.js` only if the locale list, aliases, text direction, flag label, or translation file path changes.
5. Run `npm run format` and `npm run build`.
6. In Roll20, verify `!condition-tracker --config language <locale>`, `!condition-tracker --help`, and `!condition-tracker --reinstall-handout`.

## Updating Version Metadata

If behavior changes for a release:

1. Update `script.json` version.
2. Update `package.json` version.
3. Update `CHANGELOG.md`.
4. Run `npm run build`.
5. Confirm output appears in the new version folder.
