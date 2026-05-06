# Offline and Sync Strategy — MyMedLog MVP

## 1. Purpose

Define a local-first strategy that keeps the app fully usable without backend availability, while preparing reliable automatic synchronization for later phases.

## 2. Core Principles

1. Local-first source of truth
- All user actions are committed locally first.
- UI never depends on backend round-trip to confirm local operations.

2. Eventual consistency
- Backend state may lag behind local state.
- Sync converges automatically when connectivity and backend return.

3. Durable operation log
- Mutations are represented as queued operations with metadata.
- Queue survives app restarts.

4. Non-blocking UX
- Sync failures never block core actions (CRUD, reminders, reads).

## 3. Offline Behavior Requirements

When offline or backend is unavailable:
- Create/edit/delete medicine must work locally.
- Reminder and expiration logic continues locally.
- Sync operations are queued as `pending`.
- User can keep using app normally.

When connection/backend returns:
- Sync restarts automatically in background.
- Pending operations are retried in order.
- UI remains responsive during sync.

## 4. Sync Queue Model

Each mutation generates one queue item.

Suggested operation shape:

```ts
type SyncOperationType = 'create' | 'update' | 'delete'

interface SyncQueueOperation {
  op_id: string
  entity_type: 'medicine'
  entity_id: string
  operation: SyncOperationType
  payload: unknown
  base_version: number
  status: 'pending' | 'processing' | 'failed'
  retry_count: number
  last_error: string | null
  created_at: string
  updated_at: string
}
```

Queue invariants:
- `op_id` is unique and immutable.
- Operations for same entity preserve insertion order.
- Failed operations remain recoverable.

## 5. Sync Lifecycle

1. Enqueue
- On local mutation success, append operation as `pending`.

2. Dispatch trigger
- Attempt sync on:
  - app startup
  - app resume
  - online event
  - periodic retry timer

3. Process
- Mark next pending operation as `processing`.
- Send to backend API.

4. Resolve
- Success: remove from queue (or mark done if audit retained).
- Retryable failure: mark `failed`, increment `retry_count`, schedule backoff.
- Non-retryable failure: mark `failed`, surface actionable message.

5. Continue
- Move to next operation until queue drains or stop condition occurs.

## 6. Retry and Backoff Policy (MVP)

- Exponential backoff with jitter.
- Example delays: 5s, 15s, 45s, 120s, 300s (cap).
- Reset backoff after successful operation.
- Retry budget per op in MVP: high enough for transient local-backend outages (e.g., 20 attempts).

Stop conditions:
- explicit offline detection
- repeated auth/config errors (future, when auth exists)
- malformed payload (developer error)

## 7. Conflict Strategy

MVP conflict baseline:
- Use `version` per medicine.
- Queue operation carries `base_version`.

Server-side expected behavior (future integration):
- If `base_version` matches server version, apply and increment.
- If mismatch, return conflict response.

Client conflict policy (MVP-ready foundation):
1. Fetch latest remote entity.
2. Compare remote vs local.
3. Apply deterministic policy:
   - default: local wins for user-edited fields in personal single-user context
   - preserve remote-only metadata fields
4. Generate follow-up update operation with new base version.

Rationale:
- Single-user personal app minimizes multi-actor conflicts.
- Deterministic policy avoids blocking user with manual merges in MVP.

## 8. Operation Coalescing (Optimization)

Before processing queue, apply safe coalescing rules per entity:
- `create` + `update` => merge into single `create` payload
- multiple `update` => keep latest merged `update`
- `create` + `delete` before sync => drop both
- `update` + `delete` => keep `delete`

Benefits:
- fewer backend calls
- faster convergence after long offline usage

## 9. Connectivity and Availability Detection

Signals used together:
- Browser online/offline events.
- Lightweight backend health probe.

Rules:
- Consider sync "active" only when both internet and backend availability pass.
- Avoid flapping with short stabilization window (e.g., 3-5 seconds).

## 10. UX States for Sync (MVP)

Expose simple status indicator:
- `Synced`
- `Pending changes`
- `Syncing`
- `Sync paused` (offline/backend unavailable)
- `Sync error` (requires attention)

UX requirements:
- Never block medicine management due to sync state.
- Show concise, non-intrusive status.
- Keep details optional for diagnostics.

## 11. Data Safety and Recovery

- Queue and medicines persist in IndexedDB.
- App restart must restore pending queue.
- Corrupted operation handling:
  - isolate bad op
  - continue others when safe
  - log diagnostics

## 12. Observability for Sync

Track local metrics/events:
- queue length over time
- retry_count distribution
- operation latency
- failure reason categories
- successful drain timestamp

Use logs to improve retry/conflict policy in post-MVP.

## 13. Acceptance Criteria

1. Local create/update/delete works with backend offline.
2. Queue persists across app restart.
3. Sync auto-retries when backend returns.
4. Successful sync drains queue in order.
5. Retryable failures do not block later app usage.
6. Conflict response follows deterministic local-wins baseline.
7. Sync state indicator reflects current lifecycle state.

## 14. Out of Scope for MVP

- End-to-end encrypted cloud backup.
- Multi-device real-time merge UX.
- User-configurable conflict policies.
- Cross-entity transactional sync.

## 15. Next Technical Follow-up

- Map these rules into concrete API contracts in implementation phase.
- Add integration tests with mocked intermittent backend.
