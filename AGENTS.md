# Family Cabinet agent guide

This repository is a public, static Astro archive of fictional family-made and collected objects. Keep changes small and preserve the archive's quiet, non-commercial character. User instructions take precedence over this file.

## Startup Workflow

Before writing code:

1. Read `README.md`, `feature_list.json`, and the latest entry in `progress.md`; review `session-handoff.md` if work was interrupted.
2. Check `git status --short` and recent commits. Preserve work already in progress.
3. Identify the single user-authorized feature or fix. Add or update its entry in `feature_list.json` with scope and dependencies. The README roadmap is not an automatic task list.
4. Run the existing baseline checks with `./init.sh` (Bash) or `./init.ps1` (PowerShell), unless a failing baseline is the task itself. Record failures before changing behavior.

## Project boundaries

- V1 is Astro + TypeScript + one Content Collection, static pages, local images, and GitHub Pages. Do not add a backend, database, accounts, or shopping flows for routine work.
- English stays at `/amazon-app/`; Traditional Chinese stays at `/amazon-app/zh/`. Use base-aware links and keep both page sets, metadata, search, and item translations in sync.
- Public builds must reject `family` and `private` records before Astro processes images. Never bypass the guard in `astro.config.mjs` or commit real private family data to this public repository.
- Object records live in `src/content/objects/`, images in `src/assets/items/<slug>/`, Chinese object text in `src/i18n/zh-objects.ts`, and shared UI copy in `src/i18n/ui.ts`.
- Stay in scope. Work on one feature at a time; preserve unrelated changes and avoid new dependencies unless requested.

## Verification Commands

Run in order. `verify:build` requires the freshly generated `dist/` output:

```text
npm ci
npm run check
npm test
npm run build
npm run verify:build
```

`init.sh` and `init.ps1` run this sequence and stop on failure. For a narrow edit, use the relevant focused checks during development, then run the full sequence before claiming completion.

## Definition of Done

A feature is done only when its behavior works in both languages where applicable, the public-content and `/amazon-app/` boundaries still hold, the required checks pass, and evidence is recorded in `progress.md` and `feature_list.json`. Inspect generated routes or the local preview when navigation, accessibility, layout, or client filtering changed. Report any untested production deployment separately.

## End of Session

Before ending, update feature status and verification evidence, record files changed and the next step in `progress.md`, and use `session-handoff.md` when work remains. Leave a restartable checkout. If committing, use the repository's Lore commit format: an intent-first subject and useful `Tested:` / `Not-tested:` trailers.
