# SwapTokenPositions Developer Guide

This guide is for contributors who want to edit source files and regenerate the bundled script used by Roll20.

## What You Need

- Node.js 20.x LTS (recommended)
- npm (comes with Node.js)
- Git
- A code editor (VS Code recommended)

Check your versions:

```bash
node -v
npm -v
git --version
```

If `node` is missing or old, install/update from the official Node.js website.

## Project Layout (Important)

- `src/` is the source of truth for script logic.
- `SwapTokenPositions.js` is generated output.
- `<version>/SwapTokenPositions.js` is also generated output for release/version tracking.
- `script.json` controls script metadata and the versioned output folder name.

Do not hand-edit generated bundle files.

## First-Time Setup

From the `SwapTokenPositions` directory:

```bash
npm install
```

This installs local dev dependencies (Rollup + Prettier) used by the build.

## Build Commands

### One-time build

```bash
npm run build
```

This bundles `src/index.js` and writes:

- `SwapTokenPositions.js`
- `<version>/SwapTokenPositions.js` (version taken from `script.json`)

### Watch mode (recommended while coding)

```bash
npm run watch
```

Rebuilds automatically whenever files in `src/` change.

## Typical Contributor Workflow

1. Create a branch for your change.
2. Edit code in `src/`.
3. Run `npm run build`.
4. Verify generated output is updated.
5. Manually test in Roll20.
6. Commit both source changes and generated artifacts.

## Manual Roll20 Test Loop

1. Run `npm run build`.
2. Open `SwapTokenPositions.js`.
3. Copy the full generated file.
4. Paste into Roll20: Game Settings -> Mod (API) Scripts.
5. Save and restart sandbox.
6. Run smoke checks (`!swap-tokens`, `!swap-tokens --help`).
7. Use the full checklist in `TESTING.md` for complete validation.

## Updating Version Metadata

If behavior changes in a release-worthy way:

1. Update `script.json` version.
2. Update `CHANGELOG.md`.
3. Run `npm run build`.
4. Confirm output appears in the new version folder.

## Troubleshooting

### `npm run build` fails

- Run `npm install` again.
- Remove `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell, use:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build succeeds but Roll20 behavior is unchanged

- Ensure the latest `SwapTokenPositions.js` content was pasted into Roll20.
- Save and restart the Roll20 sandbox.
- Confirm you are testing in the correct game.

### Watch mode does not appear to rebuild

- Make sure you started it from the `SwapTokenPositions` folder.
- Save the file you edited in `src/`.
- Stop and restart watch mode.

## Notes for New Contributors

- You do not need to understand Rollup internals to contribute.
- Most changes only require editing files in `src/` and running `npm run build`.
- If you are unsure what to test, start with `TESTING.md` baseline checks.
