# Test Strategy — MyMedLog MVP

## 1. Purpose

Define a pragmatic, risk-based test strategy for MVP quality, focused on correctness of reminder logic, offline reliability, and release confidence on Android PWA.

## 2. Testing Principles

1. Test business rules before UI details.
2. Prioritize deterministic time-based tests.
3. Validate offline behavior as a first-class requirement.
4. Keep test pyramid balanced: more unit, targeted integration, minimal critical E2E.

## 3. Scope by Test Level

## 3.1 Unit Tests (highest volume)

Targets:
- Domain validation rules (medicine fields, schedules, expiration config).
- Reminder calculations (fixed times, interval progression, late reminder policy).
- Expiration date target generation (single/multiple mode).
- Dedupe keys (`trigger_id`) generation stability.
- Sync backoff calculator and retry policy helpers.

Success criteria:
- Deterministic outcomes for all date/time scenarios using fake clocks.
- Edge-case coverage for invalid inputs and boundary values.

## 3.2 Integration Tests (medium volume)

Targets:
- Application use cases + local repository (IndexedDB adapter).
- Reminder engine + trigger persistence.
- Sync queue lifecycle (enqueue/process/retry/failure paths).
- Permission state handling and fallback behavior orchestration.

Success criteria:
- Core flows pass with real adapter wiring in test environment.
- Queue persistence survives simulated app restart.

## 3.3 End-to-End / Smoke Tests (low volume)

Targets:
- Critical user journeys on built app:
  1. Create medicine and verify persistence.
  2. Configure fixed-time reminder.
  3. Configure interval reminder.
  4. Configure expiration alerts (single and multiple).
  5. Validate offline usage after initial load.

Success criteria:
- All critical journeys execute without blocker errors.

## 4. Risk-Based Coverage Matrix

High risk (must be heavily tested):
- Time-based scheduling correctness.
- Duplicate notification prevention.
- Offline persistence and restart recovery.
- Queue retry behavior under intermittent backend.

Medium risk:
- Form validation UX consistency.
- Permission request flow timing.

Lower risk:
- Static display-only UI sections.

## 5. Test Data and Determinism

- Use seeded fixtures for medicines and schedules.
- Freeze clock in unit/integration tests.
- Explicit timezone fixtures (including `America/Sao_Paulo`).
- Build fixtures for boundary dates (month-end/year-end).

## 6. Time/Date Edge Cases (Mandatory)

1. Reminder near midnight rollover.
2. Multiple fixed times with some already elapsed.
3. Interval anchor changes after edit.
4. Device timezone change between runs.
5. Daylight saving transition behavior (where applicable).
6. Expiration date today/past/future boundaries.

## 7. Offline and Sync Test Scenarios

1. Create/edit/delete while offline.
2. Restart app with pending queue.
3. Backend unavailable then available again.
4. Retryable vs non-retryable failure handling.
5. Queue coalescing correctness (`create+update`, `create+delete`, etc.).
6. Sync state indicator transitions.

## 8. Notification Behavior Validation

- Validate permission states:
  - `default`
  - `granted`
  - `denied`
- Confirm no duplicate notification for same trigger.
- Validate late reminder emits at most once per relevant trigger.
- Confirm app remains usable when notifications are denied.

## 9. Non-Functional Validation

- Basic performance sanity:
  - app startup time acceptable on target Android device
  - reminder computation remains responsive with realistic medicine count
- Reliability sanity:
  - no data loss on normal restart
  - no crash on malformed local record (defensive handling)

## 10. Tooling Direction (Stack-Agnostic)

- Unit/Integration runner with fake timers support.
- Browser-like environment for application tests.
- Minimal E2E runner for smoke paths.
- Lint/typecheck included in quality gate pipeline.

Final tool choice should match project stack decisions.

## 11. CI Quality Gates

Required checks per pull request:
1. Lint passes.
2. Typecheck passes.
3. Unit tests pass.
4. Integration tests pass.

Required checks before MVP release:
1. All PR checks pass on release branch.
2. Smoke E2E passes on production-like build.
3. Manual Android PWA validation checklist passes.

## 12. Manual QA Checklist (MVP)

1. Install PWA on Android.
2. Add medicine and confirm persistence after restart.
3. Configure fixed reminder and validate trigger.
4. Configure interval reminder and validate trigger.
5. Configure expiration alerts single/multiple and validate calculation behavior.
6. Disable network and confirm app remains usable.
7. Re-enable network/backend and confirm sync status progression.
8. Deny notification permission and confirm non-blocking UX.

## 13. Exit Criteria for Release

- No open blocker defects.
- All high-risk scenarios have passing automated coverage.
- Manual QA checklist complete with evidence.
- Known limitations documented.

## 14. Known MVP Limitations to Document in Testing

- Notification behavior may vary across Android browser implementations.
- Background execution constraints can limit exact trigger timing in some conditions.
- Full cloud sync conflict observability is foundational in MVP, not fully matured.
