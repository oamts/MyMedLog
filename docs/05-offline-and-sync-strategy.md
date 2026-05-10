# Offline and Sync Strategy — MyMedLog MVP

## 1. Purpose

Define a simple offline-first strategy where local data is always written first and backend sync happens only through explicit user actions.

## 2. Core Principles

1. Local-first source of truth
- All CRUD writes are committed locally first.
- Core UX never depends on backend availability.

2. Manual sync only
- `Save data` pushes local snapshot to backend.
- `Load data` pulls backend snapshot and replaces local data.

3. Full replacement semantics
- `Save data` overwrites backend with local snapshot.
- `Load data` overwrites local store with backend snapshot.

4. Fail-safe behavior
- If `Save data` fails, local data and pending state are preserved.
- If `Load data` fails, current local data is preserved.

## 3. Manual Sync Actions

### 3.1 Save data

1. Read full local medicines dataset.
2. Send snapshot to backend endpoint.
3. Backend replaces remote dataset with snapshot.
4. On success:
   - mark medicines as `synced`
   - clear local pending-change metadata.
5. On failure:
   - stop immediately
   - keep local pending state unchanged.

### 3.2 Load data

1. Fetch full medicines dataset from backend.
2. Replace local medicines dataset completely.
3. Clear local pending-change metadata.
4. Mark local records as `synced`.

## 4. Backend Contract (MVP)

- `GET /api/v1/medicines`
  - returns full medicines list.
- `PUT /api/v1/medicines/snapshot`
  - receives full medicines list and replaces backend state.

## 5. Local Sync Metadata

Maintain minimal sync metadata:

```ts
interface SyncMeta {
  id: 'sync-meta'
  has_pending_changes: boolean
  last_manual_save_at: string | null
  last_manual_load_at: string | null
}
```

Rules:
- Any local CRUD mutation sets `has_pending_changes = true`.
- Successful `Save data` or `Load data` sets `has_pending_changes = false`.

## 6. UX Requirements

- Show clear sync actions:
  - `Save data`
  - `Load data`
- Show concise status:
  - pending local changes
  - last save/load result and timestamp
- Never block local CRUD due to backend failure.

## 7. Error Handling

- Save failure:
  - stop at first error
  - keep pending local changes
  - show error message.
- Load failure:
  - keep current local dataset untouched
  - show error message.

## 8. Acceptance Criteria

1. Local CRUD works fully without backend.
2. `Save data` overwrites backend with local snapshot.
3. `Load data` overwrites local data with backend snapshot.
4. Successful save/load clears pending local changes.
5. Failed save/load does not corrupt local data.

## 9. Out of Scope for This Phase

- Automatic background retry.
- Operation-level replay queue.
- Conflict resolution policies.
- Multi-device merge behavior.
