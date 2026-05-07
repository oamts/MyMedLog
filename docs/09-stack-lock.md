# Stack Lock — T-02

## Purpose

This document locks the technical stack decisions for T-02 and serves as the source of truth before scaffold implementation (T-03).

## Final Decisions

- Frontend app: `React` + `TypeScript` + `Vite`
- Global state: `Redux Toolkit` + `React-Redux`
- PWA tooling: `vite-plugin-pwa` (Workbox)
- Local persistence: `IndexedDB` via `Dexie`
- Validation: `Zod`
- Date/time: `date-fns` + `date-fns-tz`
- Backend API: `Node.js` + `Fastify` + `TypeScript`
- API style: `REST` + `OpenAPI 3.1`
- Frontend API data fetching: `RTK Query` (`@reduxjs/toolkit/query`)
- Client typing from API: `openapi-typescript`
- API versioning: `/api/v1`

## Architecture Direction

- Runtime behavior is local-first.
- Backend is optional/intermittent for MVP runtime.
- Sync/backup is eventual and non-blocking for core usage.
- If backend is unavailable, app remains fully usable locally.

## Why This Stack

- Preserves high development speed for MVP.
- Keeps type safety across frontend and backend.
- Uses industry-standard API contract with OpenAPI.
- Supports robust offline-first behavior for Android PWA.
- Keeps future sync evolution feasible without rewrites.

## Out of Scope in T-02

- Authentication and authorization.
- Final cloud deployment provider choice.
- Advanced observability platform setup.

## Next Step

- Execute T-03: initialize scaffold for `apps/web`, `apps/api`, and `packages/contracts` using this stack lock.
