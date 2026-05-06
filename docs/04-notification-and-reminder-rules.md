# Notification and Reminder Rules — MyMedLog MVP

## 1. Purpose

Define deterministic rules for reminder triggers and expiration alerts in the MVP, including edge cases, fallback behavior, and platform constraints for Android PWA.

## 2. Reminder Types

The system supports two reminder modes per medicine:

1. Fixed daily times
- One or more times in `HH:mm` format.
- Example: `08:00`, `20:00`.

2. Interval-based
- Allowed intervals in MVP: `6h`, `8h`, `12h`.
- Requires an anchor datetime (`starts_at`) to compute the next due trigger.

Only one schedule type is active per medicine at a time.

## 3. General Trigger Rules

1. A reminder is eligible only when:
- medicine is active
- schedule is enabled
- notification permission is granted or can be requested

2. Trigger evaluation runs on:
- app startup
- app foreground resume
- medicine create/update/delete
- periodic local recheck timer

3. Missed reminders (app closed/offline/background restrictions):
- On next evaluation, if a trigger is in the past and still relevant, emit as "late reminder" once.
- Do not emit duplicates for the same trigger key.

4. Duplicate prevention:
- Every generated trigger has a stable `trigger_id`.
- A delivered trigger is recorded locally to prevent repeated notifications.

## 4. Fixed-Time Reminder Rules

1. Normalize and validate all times (`HH:mm`, 24h).
2. Sort ascending for deterministic scheduling.
3. For current day:
- schedule all times greater than current local time.
4. For times already passed:
- evaluate late-reminder policy once on next app activity.
5. Rollover:
- after last daily time, next candidate is first time on next day.

## 5. Interval Reminder Rules

1. Compute timeline from `starts_at` + `N * interval_hours`.
2. Next due reminder is the first candidate strictly after current time.
3. If app was inactive and multiple intervals were missed:
- emit at most one late reminder on resume.
- continue from nearest future slot.
4. `starts_at` updates reset interval sequence from new anchor.

## 6. Expiration Alert Rules

## 6.1 Modes
- Single mode: one value in `days_before`.
- Multiple mode: one or more values in `days_before`.

## 6.2 Trigger Calculation
Given `expiration_date` (date-only):
- for each `d` in `days_before`, target date = `expiration_date - d days`
- if `include_on_expiration_day = true`, include `expiration_date`

## 6.3 Delivery Policy
- At most one alert per medicine per target date.
- If app was not active at target date boundary, emit one late alert when app resumes (if still relevant).
- Never emit same target date twice.

## 7. Notification Payload Guidelines

Minimum payload fields:
- `notification_id` (stable)
- `type` (`dose_reminder` | `expiration_alert`)
- `medicine_id`
- `title` (Portuguese UI text)
- `body` (Portuguese UI text)
- `scheduled_for` (ISO datetime)
- `trigger_id` (for dedupe)

Tone/UX guidance:
- concise text
- actionable intent (which medicine, what to do)
- avoid noisy repetition

## 8. Permission and Capability Handling (Android PWA)

1. If permission is `default`:
- request permission at a meaningful moment (after user enables reminders).

2. If permission is `denied`:
- keep reminders configured locally.
- show in-app guidance to re-enable notifications.

3. Sound/vibration behavior:
- attempt platform-supported options.
- gracefully degrade when browser/device restricts behavior.

4. No hard failure:
- lack of notification capability must not block CRUD or schedule setup.

## 9. Scheduling Engine Loop (MVP)

Recommended loop:
1. Load active medicines and configs.
2. Compute upcoming triggers within a rolling window (e.g., next 24h).
3. Register/display notifications using available mechanism.
4. Persist delivered trigger IDs.
5. Recompute on relevant state changes.

Rationale:
- avoids trying to pre-schedule very long horizons
- reduces drift and simplifies correction after offline periods

## 10. Edge Cases

1. Timezone change on device
- On app resume, recompute all next triggers using current timezone policy.

2. Daylight saving transitions
- Use timezone-aware date math.
- Preserve user intent for local wall-clock fixed times.

3. Expired medicine in past
- Expiration alerts are not backfilled indefinitely.
- Emit at most one late alert on first detection (if enabled).

4. Medicine disabled
- Stop generating new triggers immediately.

5. Medicine deleted (soft delete)
- Cancel future triggers for that medicine.

## 11. Test Scenarios (Must Cover)

1. Fixed-time scheduling with multiple times.
2. Interval scheduling from anchor with app restart.
3. Late reminder behavior after offline/inactive period.
4. Expiration single/multiple target date generation.
5. Dedupe guarantees for repeated app resumes.
6. Permission denied fallback path.
7. Timezone change recomputation.

## 12. Open Implementation Notes

- Exact notification API wiring depends on selected stack/service worker setup.
- Final trigger persistence schema should align with data model and sync strategy docs.
