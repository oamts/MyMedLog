# Data Model — MyMedLog MVP

## 1. Modeling Principles

- Local-first: local data is the runtime source of truth.
- Stable IDs: every record has a durable UUID for future sync.
- Explicit timestamps: every mutable record tracks creation/update times.
- Forward-compatible: include optional sync metadata from day one.

## 2. Core Entities

### 2.1 Medicine

Required MVP fields:
- `id`
- `name`
- `expiration_date` (optional)
- `schedule_type_and_times`

Extended operational fields (recommended in MVP foundation):
- `created_at`
- `updated_at`
- `sync_status` (`synced` | `pending`)

### 2.2 ReminderSchedule

Represents schedule configuration for one medicine.

Fields:
- `medicine_id`
- `schedule_type` (`fixed_times` | `interval_hours`)
- `fixed_times` (array of `HH:mm`, required if `fixed_times`)
- `interval_hours` (number, required if `interval_hours`)
- `timezone` (IANA string, ex.: `America/Sao_Paulo`)
- `starts_at` (ISO datetime; used for interval anchor)
- `is_enabled` (boolean)

### 2.3 ExpirationAlertConfig

Fields:
- `medicine_id`
- `mode` (`single` | `multiple`)
- `days_before` (array of non-negative integers)
- `include_on_expiration_day` (boolean)
- `is_enabled` (boolean)

## 3. TypeScript Reference Model

```ts
export type UUID = string

export type ScheduleType = 'fixed_times' | 'interval_hours'
export type ExpirationAlertMode = 'single' | 'multiple'

export interface Medicine {
  id: UUID
  name: string
  expiration_date?: string // YYYY-MM-DD
  schedule_type_and_times: ReminderSchedule
  expiration_alert_config: ExpirationAlertConfig
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
  sync_status: 'synced' | 'pending'
}

export interface ReminderSchedule {
  medicine_id: UUID
  schedule_type: ScheduleType
  fixed_times: string[] | null // HH:mm
  interval_hours: 6 | 8 | 12 | null
  timezone: string
  starts_at: string // ISO 8601
  is_enabled: boolean
}

export interface ExpirationAlertConfig {
  medicine_id: UUID
  mode: ExpirationAlertMode
  days_before: number[] // e.g. [30] or [30, 7, 1]
  include_on_expiration_day: boolean
  is_enabled: boolean
}
```

## 4. Validation Rules

### 4.1 Medicine
- `name`: required, trimmed, 1..120 chars.
- `expiration_date`: optional; when present, valid date in `YYYY-MM-DD`.
- `sync_status`: default `pending` after local mutation; set to `synced` after successful `Save data`.

### 4.2 ReminderSchedule
- `schedule_type = fixed_times`:
  - `fixed_times` required with at least 1 value.
  - Each entry must match `HH:mm` (24h).
  - No duplicates after normalization.
- `schedule_type = interval_hours`:
  - `interval_hours` required and in `{6, 8, 12}` for MVP.
  - `starts_at` required.
- `timezone` required.

### 4.3 ExpirationAlertConfig
- `mode = single`:
  - `days_before` must have exactly 1 item.
- `mode = multiple`:
  - `days_before` must have 1..10 items (MVP practical ceiling).
- For both modes:
  - all values must be integers >= 0
  - no duplicates
  - sorted descending for deterministic processing

## 5. IndexedDB Store Design (Initial)

Recommended object stores:
- `medicines`
  - keyPath: `id`
  - indexes: `expiration_date`, `updated_at`, `sync_status`
- `sync_meta`
  - keyPath: `id` (single record)
  - stores pending-change flag and last manual sync timestamps

Recommended `sync_meta` shape:

```ts
export interface SyncMeta {
  id: 'sync-meta'
  has_pending_changes: boolean
  last_manual_save_at: string | null
  last_manual_load_at: string | null
}
```

## 6. Time and Date Conventions

- Date-only fields use `YYYY-MM-DD` (`expiration_date`).
- Datetime fields use UTC ISO 8601 strings.
- Schedule evaluation uses local timezone from `timezone`.
- UI displays localized values in Portuguese format, but storage stays normalized.

## 7. Delete Strategy

- Use physical delete in local store for MVP simplicity.
- Deletion is propagated to backend only when user clicks `Save data`.

## 8. Migration Strategy (Early)

- Persist a local schema version.
- Add idempotent migration steps per version bump.
- Never mutate data shape without migration path.

## 9. Testability Targets for This Model

- Validation tests for all field constraints.
- Schedule shape tests for both schedule types.
- Expiration config normalization tests (dedupe/sort).
- Serialization/deserialization tests for storage round-trip.

## 10. Open Follow-ups

1. Exact reminder trigger algorithm and edge cases: `docs/04-notification-and-reminder-rules.md`
2. Manual snapshot save/load UX and failure handling details: `docs/05-offline-and-sync-strategy.md`
