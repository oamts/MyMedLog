# Release Checklist — MyMedLog MVP

## 1. Purpose

Provide a clear go/no-go checklist for releasing the MVP with confidence, covering product scope, technical quality, offline behavior, and Android PWA readiness.

## 2. Release Scope Confirmation

- MVP scope matches `docs/01-product-requirements.md`.
- Out-of-scope items remain excluded (no login, no dose history, no low-stock alerts, no barcode).
- All documented acceptance criteria CA-01..CA-08 are validated.

## 3. Code and Architecture Readiness

- Module boundaries follow architecture document.
- Domain rules are isolated and testable.
- No temporary debug code or mock-only paths left enabled.
- Configuration values are environment-safe for release build.

## 4. Automated Quality Gates

- Lint passes.
- Typecheck passes.
- Unit test suite passes.
- Integration test suite passes.
- Smoke E2E scenarios pass.

Required evidence:
- CI run links or exported logs for release candidate commit.

## 5. Functional Verification

- Medicine create/edit/delete works locally.
- Fixed-time reminders configured and triggered correctly.
- Interval reminders configured and triggered correctly.
- Expiration alerts work in single and multiple modes.
- Notification permission denied path is non-blocking.

## 6. Offline and Sync Verification

- App remains usable with internet disabled.
- Data persists after app restart while offline.
- Local mutations enqueue sync operations.
- Sync status indicator reflects real state transitions.
- Auto-retry starts when backend/connectivity returns.

## 7. Android PWA Readiness

- Web app manifest is valid and complete.
- Service worker registered and active in production build.
- App install flow works on target Android device.
- Core routes open offline after first successful load.
- Icons/splash/meta assets render correctly in installed mode.

## 8. Notifications Readiness

- Permission request appears at the intended UX moment.
- Granted permission produces visible notification output.
- Dedupe prevents duplicate notifications for same trigger.
- Late reminder policy emits at most one relevant late event.
- Sound/vibration behavior degrades gracefully when unsupported.

## 9. Data Safety and Recovery

- IndexedDB schema version and migrations verified.
- No data loss on normal restart/refresh.
- Corrupted queue item handling does not block all processing.
- Soft-deleted medicines do not continue generating triggers.

## 10. Performance and Stability Sanity

- Startup time acceptable on target Android device.
- Reminder computation remains responsive with realistic data volume.
- No recurring crashes in normal usage flows.
- Memory/resource usage has no obvious regression in smoke session.

## 11. Documentation and Operations

- Product requirements document is current.
- Architecture/data/sync/test docs reflect final MVP behavior.
- Known limitations are documented.
- Post-MVP backlog is updated with deferred items.

## 12. Release Candidate Sign-off

Sign-off roles (can be same person in solo project):
- Product sign-off: scope and UX acceptable.
- Technical sign-off: quality gates and architecture compliance.
- QA sign-off: checklist executed and evidence recorded.

Record:
- Release version/tag:
- Commit SHA:
- Build date:
- Device/browser validated:

## 13. Go/No-Go Decision Rules

Go only if all are true:
1. No blocker defects open.
2. All automated gates green.
3. Offline core flow validated.
4. Critical reminders/alerts validated.

No-Go if any are true:
1. Data loss risk not mitigated.
2. Reminder duplication bug unresolved.
3. Offline flow breaks core CRUD.
4. Installability/offline shell fails on target Android.

## 14. Immediate Post-Release Tasks

- Monitor first-run logs/errors.
- Track reminder reliability incidents.
- Review sync queue behavior under real intermittent backend conditions.
- Prioritize first stabilization patch if needed.
