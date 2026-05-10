# MVP Delivery Plan — MyMedLog

## 1. Purpose

Define a practical, phase-based execution plan for shipping the MVP with quality gates, clear acceptance criteria, and low-risk sequencing.

## 2. Delivery Strategy

- Build vertical slices in priority order.
- Validate each slice with focused tests before moving on.
- Keep architecture decisions explicit and traceable.
- Preserve offline-first behavior in every feature increment.

## 3. Milestones Overview

1. M0 — Foundation and standards
2. M1 — Local medicine management
3. M2 — Reminder engine (fixed + interval)
4. M3 — Expiration alerts
5. M4 — Offline hardening and sync foundation
6. M5 — PWA readiness and release

## 4. Milestone Details

## M0 — Foundation and Standards

Goals:
- Initialize project structure and baseline tooling.
- Define coding conventions and module boundaries.
- Establish documentation and quality gates.

Deliverables:
- Project skeleton with layered folders.
- Lint/format/test baseline.
- PWA bootstrap (manifest + service worker setup scaffold).

Acceptance criteria:
- Project runs locally.
- CI baseline checks pass (lint + unit test command ready).
- Folder/module structure matches architecture document.

## M1 — Local Medicine Management

Goals:
- Implement medicine CRUD with local persistence.
- Enforce validation rules from data model.

Deliverables:
- Medicine form (create/edit).
- Medicine list and delete flow (soft delete).
- IndexedDB repository adapter for medicines.

Acceptance criteria:
- User can create, edit, delete medicine offline.
- Data persists after app restart.
- Validation errors are clear in Portuguese UI.

## M2 — Reminder Engine (Fixed + Interval)

Goals:
- Implement schedule calculations and trigger dedupe.
- Wire reminder notifications with fallback behavior.

Deliverables:
- Domain reminder scheduler for fixed times and intervals.
- Trigger persistence store (`trigger_id` delivered log).
- Notification adapter integration.

Acceptance criteria:
- Fixed-time reminders trigger correctly.
- Interval reminders trigger correctly from anchor time.
- Duplicate notifications are prevented on resume.

## M3 — Expiration Alerts

Goals:
- Implement single/multiple expiration alert policies.
- Reuse notification channel with deterministic rules.

Deliverables:
- Expiration target-date generator.
- Alert trigger planner + dedupe integration.
- UI settings for single/multiple alert modes.

Acceptance criteria:
- Alerts fire for configured offsets.
- Include-on-expiration-day works as configured.
- Missed-alert policy emits at most one late alert.

## M4 — Offline Hardening and Sync Foundation

Goals:
- Add manual sync foundation with explicit save/load actions.
- Keep user flows non-blocking under backend outages.

Deliverables:
- Local pending-change metadata store.
- `Save data` action: local snapshot overwrites backend.
- `Load data` action: backend snapshot overwrites local.
- Sync status indicator for pending/synced and last manual action.

Acceptance criteria:
- Local operations always succeed without backend.
- Pending state survives restart.
- Manual save/load works deterministically with full replacement semantics.

## M5 — PWA Readiness and Release

Goals:
- Ensure installability, offline shell, and release confidence.

Deliverables:
- Production-ready manifest/service worker settings.
- Basic error handling and diagnostics logging.
- Release checklist execution and tagged MVP build.

Acceptance criteria:
- PWA is installable on Android.
- Core routes load offline after first install.
- Manual QA checklist completed for MVP scope.

## 5. Suggested Timeline (Lean)

- Week 1: M0 + M1
- Week 2: M2
- Week 3: M3 + M4
- Week 4: M5 + stabilization

Note: Timeline can be compressed/expanded based on test depth and platform behavior findings.

## 6. Test Strategy by Milestone

- M0: tooling sanity tests
- M1: repository + form validation unit/integration tests
- M2: scheduler algorithm tests with deterministic clocks
- M3: expiration calculation tests and dedupe tests
- M4: manual save/load sync tests with simulated outages
- M5: smoke E2E + Android install/offline manual validation

## 7. Quality Gates (Go/No-Go)

A milestone is complete only if:
1. Acceptance criteria pass.
2. No known blocker defects remain open.
3. Regression checks pass for previously shipped slices.
4. Documentation impacted by the milestone is updated.

## 8. Risk Register (Execution)

1. PWA background behavior variance across Android browsers.
- Mitigation: validate early in M2 with real-device tests.

2. Time/date edge cases causing reminder drift.
- Mitigation: deterministic time tests and timezone scenarios.

3. Queue complexity growth.
- Mitigation: keep sync foundation minimal in MVP, expand post-release.

## 9. Definition of Done (MVP Release)

- In-scope features complete and validated.
- Offline core behavior verified.
- Reminder + expiration rules validated against documented scenarios.
- Build is installable as Android PWA.
- Release checklist complete and documented.

## 10. Post-MVP Priority Backlog

1. Barcode/scan intake.
2. Full backend sync contract and conflict telemetry.
3. Optional cloud backup/restore UX.
4. Dose history and adherence tracking.
