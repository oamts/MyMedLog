# System Architecture — MyMedLog MVP

## 1. Architecture Goals

This architecture is designed to:
- Keep the app fully usable offline (local-first).
- Isolate domain rules from UI and infrastructure.
- Support future cloud sync without major rewrites.
- Work reliably as a PWA on Android.

## 2. High-Level Architecture

The system follows a layered architecture:

1. Presentation Layer
- PWA UI (Portuguese) for medicine CRUD and reminder setup.
- View state, form validation feedback, and user actions.

2. Application Layer
- Use cases that coordinate business actions:
  - create/update/delete medicine
  - schedule reminders
  - compute expiration alerts
  - enqueue sync operations

3. Domain Layer
- Core entities and rules:
  - medicine model
  - schedule model (fixed time / interval)
  - expiration alert policy (single/multiple)
- Pure logic, no browser or API dependencies.

4. Infrastructure Layer
- Local database/storage adapter.
- Notification adapter (service worker + Notifications API).
- Sync adapter (future backend integration).
- Connectivity detector and retry logic.

## 3. Runtime Components

### 3.1 Web App Shell
- Loads UI and routes.
- Registers service worker.
- Boots local data access and reminder engine.

### 3.2 Service Worker
- Caches static assets for offline startup.
- Supports notification display when triggered.
- Handles background sync hooks where supported.

### 3.3 Local Data Store
- Source of truth during MVP runtime.
- Stores medicines and reminder configurations.
- Stores future sync metadata (operation queue, timestamps, versions).

### 3.4 Reminder Engine
- Resolves next trigger time for fixed schedules and intervals.
- Recomputes triggers when medicine data changes.
- Delegates notification display to notification adapter.

### 3.5 Sync Engine (Foundation in MVP)
- Persists outbound operations in a queue.
- Detects online/backend availability.
- Replays queued operations in order when available.
- Conflict policy to be defined in `docs/05-offline-and-sync-strategy.md`.

## 4. Data Flow (Core Scenarios)

### 4.1 Create medicine
1. User submits form.
2. Application layer validates input using domain rules.
3. Local store persists medicine.
4. Reminder engine recalculates triggers.
5. Sync operation is queued (future-ready).

### 4.2 Reminder trigger
1. Reminder engine determines due reminder.
2. Notification adapter requests display through platform APIs.
3. User receives notification with available sound/vibration behavior.

### 4.3 Offline update with later sync
1. User edits medicine while offline.
2. Local store writes immediately.
3. Sync operation is queued with metadata.
4. When connectivity/backend returns, sync engine retries automatically.

## 5. Proposed Module Boundaries

- `src/domain/*`
  - entities, value objects, validation, scheduling and expiration policies.
- `src/application/*`
  - use cases and orchestrators.
- `src/infrastructure/*`
  - storage, notification, sync, connectivity adapters.
- `src/presentation/*`
  - screens, components, forms, route handlers.
- `src/shared/*`
  - common utilities, types, and constants.

## 6. Technology Direction (Initial)

Recommended initial stack:
- Frontend: React + TypeScript + Vite (PWA plugin).
- Local persistence: IndexedDB via lightweight wrapper.
- Caching/offline assets: Workbox through Vite PWA tooling.
- Notifications: Web Notifications API + Service Worker integration.

Rationale:
- Strong ecosystem and fast iteration for MVP.
- Good separation between UI and domain logic.
- Practical path to progressive hardening.

## 7. Non-Functional Architecture Decisions

1. Local-first source of truth in MVP
- Guarantees app continuity when backend is unavailable.

2. Domain logic pure and testable
- Reduces risk in time-based reminder/expiration rules.

3. Sync as append-only operations queue
- Simplifies reliability and retry semantics.

4. Progressive enhancement for background features
- Uses best available browser/device capabilities with fallback behavior.

## 8. Observability (MVP-appropriate)

- Client-side structured logs for key events:
  - reminder scheduling failures
  - notification permission state changes
  - sync retries and failures
- Minimal error boundary in UI for recoverable failures.
- Diagnostics panel can be added later for personal troubleshooting.

## 9. Security and Privacy Baseline

- No authentication in MVP by requirement.
- Keep data local by default.
- Avoid unnecessary personal data fields.
- Prepare for optional encrypted backup path in future phases.

## 10. Open Decisions for Next Docs

1. Exact data schema and IDs: `docs/03-data-model.md`
2. Reminder/notification timing semantics: `docs/04-notification-and-reminder-rules.md`
3. Queue format, retry policy, conflict resolution: `docs/05-offline-and-sync-strategy.md`
