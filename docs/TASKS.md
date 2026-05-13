# TASKS — MyMedLog

Use these IDs to tell where we are.

Status legend:
- `todo`
- `in_progress`
- `done`

## Task List

- `T-01` Finalize product scope and acceptance criteria (MVP locked) — `done`
- `T-02` Confirm final stack (frontend, storage, PWA, notifications) — `done` (see `docs/09-stack-lock.md`)
- `T-03` Initialize project scaffold (base folders, tooling, scripts) — `done`
- `T-04` Configure PWA foundation (manifest, service worker, installability) — `done`
- `T-05` Implement medicine data model + validations — `done`
- `T-06` Implement local persistence (IndexedDB repository) — `done`
- `T-07` Build medicine CRUD UI (create/edit/list/delete) — `done`
- `T-08` Implement fixed-time reminder engine — `done`
- `T-09` Implement interval reminder engine (6h/8h/12h) — `done`
- `T-10` Implement notification delivery + permission handling — `done`
- `T-11` Implement expiration alerts (single + multiple) — `done`
- `T-12` Add reminder/alert deduplication (`trigger_id` strategy) — `done`
- `T-13` Add offline-first behavior checks across core flows — `done`
- `T-14` Implement manual sync foundation (`Save data` + `Load data`) — `done`
- `T-15` Simplify pending-change metadata and sync status UX — `done`
- `T-16` Add sync status indicator in UI — `done`
- `T-17` Write unit tests for domain rules (schedule/expiration/validation) — `in_progress`
- `T-18` Write integration tests (storage + reminders + manual save/load sync) — `todo`
- `T-19` Run Android PWA manual QA (install/offline/notifications) — `todo`
- `T-20` Release checklist + MVP cut — `todo`
