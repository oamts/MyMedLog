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
- Task ID: T-17
- Title: Write unit tests for domain rules (schedule/expiration/validation)
- Status: in_progress
- Why this task now: sync status indicator is complete and the next milestone is expanding automated domain coverage.

## Progress Update
- Added production PWA icons (`192`, `512`, `maskable`, `apple-touch`) under `apps/web/public`.
- Hardened PWA config in `apps/web/vite.config.ts` with manifest metadata and Workbox runtime caching.
- Added explicit service worker registration via `apps/web/app/pwa.ts` and import in `apps/web/app/main.tsx`.
- Added installability metadata in `apps/web/index.html` (`theme-color`, Apple tags, mask icon).
- Local validation: `npm run build -w @mymedlog/web` succeeds and generates `sw.js` + precache manifest.
- Added medicine contracts and validation schemas in `packages/contracts/src/index.ts` using Zod.
- Added schedule discriminated union (`fixed_time` and `interval_hours` with allowed values 6/8/12).
- Simplified medicine model by removing dosage and start/end dates; `expiresOn` is now optional.
- Monorepo typecheck passes after contract changes.
- Added IndexedDB local repository using Dexie in `apps/web/app/services/db.ts`.
- Added local create/list flow in UI, persisting medicine before optional API sync call.
- Added local update/delete repository functions and wired full CRUD controls in UI.
- Added fixed-time reminder domain logic in `apps/web/src/domain/reminders/fixedTime.ts`.
- Added unit tests for fixed-time scheduling behavior in `apps/web/src/domain/reminders/fixedTime.test.ts`.
- Added reminder integration entrypoint `apps/web/app/services/reminderEngine.ts` for local schedule queries.
- Reminder calculations currently use device local timezone for MVP.
- Added interval reminder domain logic in `apps/web/src/domain/reminders/interval.ts`.
- Added unit tests for interval scheduling behavior in `apps/web/src/domain/reminders/interval.test.ts`.
- Expanded reminder integration to expose fixed, interval, and merged local schedules.
- Added notification adapter in `apps/web/app/services/notifications.ts` with permission handling and in-session dedupe.
- Added foreground reminder polling in `apps/web/app/App.tsx` to dispatch local notifications for due reminders.
- Added notification permission status and enable action in UI.
- Added expiration alert configuration to shared contracts with single/multiple validation rules.
- Added expiration alert schedule engine with tests.
- Integrated expiration alerts into merged local reminder schedule and notification payload handling.
- Added persistent trigger deduplication store in IndexedDB (`deliveredTriggers`).
- Notification dispatch now checks persisted trigger IDs before emitting and records successful deliveries.
- Added trigger retention pruning to prevent unbounded dedupe storage growth.
- Prepared offline QA execution checklist in `docs/10-offline-qa-checklist.md`.
- Completed automated offline baseline (`test`, `typecheck`, `build`) with all checks passing.
- Executed manual offline QA checklist with all mandatory scenarios marked PASS.
- Fixed reminder due-window tolerance to include short late window and validated notification + dedupe behavior.
- Product decision: keep offline-first writes and sync only on explicit actions (`Save data` and `Load data`).
- Product decision: `Save data` overwrites backend; `Load data` overwrites local and clears pending changes.
- Implemented backend snapshot endpoints (`GET /api/v1/medicines`, `PUT /api/v1/medicines/snapshot`).
- Implemented manual sync controls in UI with pending-change metadata and last save/load timestamps.
- Migrated web runtime structure fully to `apps/web/app/*`.
- Consolidated manual sync state handling into `useManualSyncStatus` hook.
- Simplified Save/Load status transitions (`saving`, `loading`, `synced`, `error`) and unified feedback messages.
- Added dedicated `SyncStatusIndicator` UI component with compact, reusable visual status rendering.

## Last Completed
- Task ID: T-16
- Result: Sync status indicator component added and integrated into main UI flow.
- Evidence:
  - `apps/web/app/components/SyncStatusIndicator.tsx`
  - `apps/web/app/App.tsx`

## Next Exact Step
- Action to execute next: Add/update domain unit tests to cover current contract rules and edge cases for reminder/expiration validation.
- Expected output: Broader deterministic unit coverage for domain behavior used in production flows.
- Definition of done for next step: T-17 marked `done` with tests added for uncovered validation and scheduling boundaries.

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
