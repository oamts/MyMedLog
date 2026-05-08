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
- Task ID: T-10
- Title: Implement notification delivery + permission handling
- Status: in_progress
- Why this task now: both fixed-time and interval scheduling are implemented, so notification delivery can now consume real schedules.

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
- Added interval reminder domain logic in `apps/web/src/domain/reminders/interval.ts`.
- Added unit tests for interval scheduling behavior in `apps/web/src/domain/reminders/interval.test.ts`.
- Expanded reminder integration to expose fixed, interval, and merged local schedules.

## Last Completed
- Task ID: T-09
- Result: Interval reminder engine (6h/8h/12h) implemented with test coverage and merged schedule integration.
- Evidence:
  - `apps/web/src/domain/reminders/interval.ts`
  - `apps/web/src/domain/reminders/interval.test.ts`
  - `apps/web/src/services/reminderEngine.ts`

## Next Exact Step
- Action to execute next: Build notification adapter for permission flow and trigger dispatch from reminder schedule results.
- Expected output: Service that requests permission, reports permission state, and emits local notifications for due reminders.
- Definition of done for next step: T-10 marked `done` with permission handling and notification dispatch wired to schedule engine outputs.

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
