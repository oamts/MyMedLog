# Offline QA Checklist — T-13

## Purpose

Execute and record offline-first verification across core MVP flows.

## Environment

- Date: 2026-05-08
- Project: MyMedLog
- Web app URL: `http://localhost:5173`
- API URL: `http://localhost:3333`
- Browser/device: Local browser desktop (manual run)

## Automated Baseline (Completed)

- `npm run test -w @mymedlog/web` -> PASS (12 tests)
- `npm run typecheck` -> PASS (contracts/api/web)
- `npm run build` -> PASS (contracts/api/web)
- PWA build output generated (`sw.js`, precache manifest) -> PASS

## Manual Offline Checklist (Run and mark)

Status legend: `PASS`, `FAIL`, `BLOCKED`, `N/A`

1) First-load online and service worker activation
- Steps:
  - Open app online.
  - Confirm service worker active in DevTools Application tab.
- Result: `PASS`
- Notes: Validated in production preview mode (`npm run preview -w @mymedlog/web`), service worker active.

2) CRUD local while offline (create/edit/delete)
- Steps:
  - Disable network.
  - Create medicine.
  - Edit same medicine.
  - Delete same medicine.
- Expected:
  - All actions complete without API dependency.
  - UI updates immediately from local storage.
- Result: `PASS`
- Notes: Create, edit, and delete completed with network offline and immediate UI updates.

3) Offline reload persistence
- Steps:
  - With network still disabled, reload page.
  - Verify local records remain available.
- Expected:
  - App shell loads.
  - Local data still present from IndexedDB.
- Result: `PASS`
- Notes: Reload offline kept app shell available and local medicines persisted.

4) Reminder schedule evaluation with API unavailable
- Steps:
  - Keep API stopped or network disabled.
  - Keep at least one medicine with reminder config.
  - Verify app remains usable and no fatal errors.
- Expected:
  - Reminder schedule loop runs locally.
  - No dependency on API for core flow.
- Result: `PASS`
- Notes: API unavailable state did not block local reminder/runtime flows.

5) Notification permission denied path
- Steps:
  - Set notification permission to denied.
  - Use app and save medicine.
- Expected:
  - App remains functional.
  - Notification-only behavior is skipped gracefully.
- Result: `PASS`
- Notes: Core app behavior remained functional with notifications denied.

6) Dedupe across reload/restart
- Steps:
  - Trigger one due notification.
  - Reload page.
  - Re-run same due window.
- Expected:
  - Same `trigger_id` does not notify again.
- Result: `PASS`
- Notes: After timing-window adjustment, notification fired once and did not repeat for same `trigger_id` after reload.

## Exit Criteria for T-13

- All mandatory scenarios marked `PASS`.
- Any `FAIL` has a linked fix task.
- Evidence recorded (browser/device + notes).
