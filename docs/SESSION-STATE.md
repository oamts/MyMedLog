# SESSION STATE — MyMedLog

## Project Snapshot
- Project: MyMedLog
- Date: 2026-05-06
- Owner: Mateus
- Assistant mode: Tech Lead + Mentor

## Current Phase
- Milestone: M0
- Phase goal: Finalize PWA baseline and installability settings.

## Current Task
- Task ID: T-09
- Title: Implement interval reminder engine (6h/8h/12h)
- Status: in_progress
- Why this task now: fixed-time reminder foundation is complete; interval cadence is the next supported schedule type.

## Progress Update
- Added production PWA icons (`192`, `512`, `maskable`, `apple-touch`) under `apps/web/public`.
- Hardened PWA config in `apps/web/vite.config.ts` with manifest metadata and Workbox runtime caching.
- Added explicit service worker registration via `apps/web/src/pwa.ts` and import in `apps/web/src/main.tsx`.
- Added installability metadata in `apps/web/index.html` (`theme-color`, Apple tags, mask icon).
- Local validation: `npm run build -w @mymedlog/web` succeeds and generates `sw.js` + precache manifest.
- Added medicine contracts and validation schemas in `packages/contracts/src/index.ts` using Zod.
- Added schedule discriminated union (`fixed_time` and `interval_hours` with allowed values 6/8/12).
- Simplified medicine model by removing dosage and start/end dates; `expiresOn` is now optional.
- Monorepo typecheck passes after contract changes.
- Added IndexedDB local repository using Dexie in `apps/web/src/services/db.ts`.
- Added local create/list flow in UI, persisting medicine before optional API sync call.
- Added local update/delete repository functions and wired full CRUD controls in UI.
- Added fixed-time reminder domain logic in `apps/web/src/domain/reminders/fixedTime.ts`.
- Added unit tests for fixed-time scheduling behavior in `apps/web/src/domain/reminders/fixedTime.test.ts`.
- Added reminder integration entrypoint `apps/web/src/services/reminderEngine.ts` for local schedule queries.
- Reminder calculations currently use device local timezone for MVP.

## Last Completed
- Task ID: T-08
- Result: Fixed-time reminder engine implemented with test coverage and integration entrypoint.
- Evidence:
  - `apps/web/src/domain/reminders/fixedTime.ts`
  - `apps/web/src/domain/reminders/fixedTime.test.ts`
  - `apps/web/src/services/reminderEngine.ts`

## Next Exact Step
- Action to execute next: Implement interval scheduling (`everyHours` in 6/8/12) using local timezone anchors.
- Expected output: Deterministic next-trigger calculation for interval-based medicines.
- Definition of done for next step: T-09 marked `done` with unit tests covering rollover and anchor-time behavior.

## Open Decisions / Blockers
- D-001: Package manager set to `npm workspaces` for MVP simplicity | Owner: Mateus | Status: closed
- B-001: none | Impact: none | Mitigation: n/a

## Risks to Watch
- R-001: Android PWA notification behavior variance by browser | Level: medium | Mitigation: validate early during reminder implementation.

## Resume Prompt (Copy/Paste)
```text
Retomada de contexto do projeto MyMedLog.

Use este estado como fonte da verdade:
[cole aqui o conteúdo de docs/SESSION-STATE.md]

Regras:
1) Não replanejar do zero.
2) Continuar a partir de "Next Exact Step".
3) Gerar apenas 1 arquivo por vez (caminho + objetivo + conteúdo + decisão técnica).
4) Ao final, atualizar a proposta do próximo passo e parar aguardando "ok".
```
