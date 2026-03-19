# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check then bundle (tsc && vite build)
npm run preview      # Serve the production build locally
npm run lint         # ESLint over src/
npm run format       # Prettier over src/
npm run type-check   # tsc --noEmit (no emit, just type errors)
```

There is no test suite.

## Architecture

**Stack:** React 19 + TypeScript, Vite SPA, Supabase (Postgres + Auth), Leaflet for maps, `add-to-calendar-button` web component.

### Custom SPA routing

There is no React Router or Next.js. Routing is implemented manually in `src/main.tsx` using the History API:

- `View` (union type in `src/utils/views.ts`) is the source of truth for what is rendered.
- `PAGE_PATHS` maps navigable views to URL paths; `PATH_TO_VIEW` is the reverse.
- `handleNavigate(v: View)` is the single navigation entry point — it updates the URL, clears stale cross-view state (search open, viewing event, add-event prefill), and calls `setView`.
- Views like `add-event`, `edit-event`, and `delete-event` have no URL path of their own — they are overlaid on top of the previous URL.
- Deep links (`/event/:id`) are resolved on first load and on `popstate`.

### Add-event flow state

Two mutually exclusive states live alongside `view`:
- `addEventDate: string | undefined` — prefills the start date (set when navigating from a calendar day cell).
- `duplicatingEvent: Event | null` — prefills all fields (set when duplicating an existing event).

They are always set together (one set, the other cleared) and both reset on any navigation away from `add-event`. These are passed as `prefillDate` / `prefillEvent` props to `<AddEvent>`.

### Data layer

- `src/supabaseClient.ts` exports a single `supabase` client. The URL and anon key are hardcoded (env var approach was dropped due to a Cloudflare Pages issue).
- `src/utils/queries.ts` exports `approvedEventsQuery()` as the base query for all approved-event fetches.
- All Supabase queries live in hooks (`useCalendarEvents`, `useUpcomingEvents`) or directly in page components. There is no separate data/service layer.
- The `events` table has an `approved` boolean. Unapproved events are only visible to admins via `AdminQueue`.

### Recurrence

Events can belong to a recurring series. The `recurrence` column stores a `RecurrenceRule` JSON object (`src/utils/recurrence.ts`). Key points:

- A shared UUID (`recurrence.id`) links all occurrences of the same series — the database stores one row *per occurrence*.
- `expandRecurrences()` generates up to 1 year of occurrences from a first start date.
- `deduplicateByRecurrence()` collapses a list of events to one per series (used for pending/badge counts).
- When editing/deleting, the admin is prompted for scope: this occurrence only, this + future, or all.

### Auth

`src/hooks/useAuth.ts` wraps Supabase auth. It resolves the session on mount, subscribes to `onAuthStateChange`, and exposes `isLoggedIn`, `adminName`, `userEmail`, badge counts, and `handleLogout`. Auth-guarded views (`admin-*`, `account`, `edit-event`) are enforced in a `useEffect` in `main.tsx` that watches `view` and `isLoggedIn`.

### Theming

`src/hooks/useTheme.ts` manages a `light`/`dark` preference persisted in `localStorage`, applied as a `data-theme` attribute on `<html>`. Multiple named themes beyond light/dark are supported.
