# Task Management System

Single-page task management app built with **Angular (standalone components + lazy-loaded routes)**, styled with **Tailwind CSS** and **PrimeNG**, backed by a small **Express** API for local development.

## Project overview

- **Web app**: Angular 21 application under `src/`
- **API**: Node/Express server under `server/` with JSON files in `server/data/`
- **Dev experience**: one command starts both API + web via a proxy (`/api` → `http://localhost:3000`)

### Key architecture decisions

- **Standalone + lazy routes**: routes use `loadComponent` to keep initial bundle smaller and split features by route.
- **Feature-based structure**: `src/features/*` holds pages; `src/shared/*` holds reusable components/models/services; `src/core/*` holds cross-cutting concerns (auth, i18n, interceptors, providers).
- **Local-first API**: the Express API persists to JSON for repeatable demos without a database.

## Architecture (high level)

```
src/
  app/                 # app bootstrap, routing, root outlets
  core/                # auth, i18n, http interceptor, providers, constants
  features/            # routed pages (dashboard, tasks, team, analytics, ...)
  shared/              # reusable UI + domain models + client-side stores
  testing/             # test fixtures + lightweight service mocks
server/
  src/server.js        # REST API (JSON persistence)
  data/                # users.json / tasks.json / statistics.json
  scripts/             # seed generator
```

## Setup and installation

### Prerequisites

- **Node.js** (recommended: a recent LTS)
- **npm** (repo expects npm; see `package.json` `packageManager`)

### Install dependencies

```bash
npm install
npm install --prefix server
```

## Environment configuration

### Web app

- **API base URL**: the web app calls the API at `API_BASE = '/api'` (see `src/core/api/api.constants.ts`).
- **Dev proxy**: `ng serve` uses `proxy.conf.json` to forward `/api` to `http://localhost:3000`.

If you change the API port, update `proxy.conf.json` accordingly.

### API server (`server/`)

Environment variables (optional):

- **`PORT`**: API port (default `3000`)
- **`JWT_SECRET`**: JWT signing secret (default is a dev-only value)
- **`CORS_ORIGIN`**: allowed origin (default `http://localhost:4200`)

Example (PowerShell):

```powershell
$env:PORT=3000
$env:JWT_SECRET="dev-secret"
$env:CORS_ORIGIN="http://localhost:4200"
npm run start --prefix server
```

### Demo login

Seeded users (created by `server/scripts/generate-data.js`) have password **`demo`**. Usernames are derived from the email local-part, for example:

- `john.doe` / `demo`
- `sarah.smith` / `demo`
- `mike.johnson` / `demo`
- `emily.davis` / `demo`

## Available scripts and commands

From repo root:

- **`npm start`**: starts **API + Web** concurrently (API on `3000`, Web on `4200`)
- **`npm run start:web`**: starts Angular dev server only
- **`npm run start:server`**: starts API only (`--prefix server`)
- **`npm run server:dev`**: starts API in watch mode
- **`npm run server:generate`**: regenerates seed JSON data under `server/data/`
- **`npm test`**: runs unit tests
- **`npm run build`**: production build
- **`npm run watch`**: dev build in watch mode

## Design patterns and state management

### Routing & composition

- **Route guards**: `authGuard` protects the authenticated area; `guestGuard` protects login.
- **Shell layout**: `DashboardLayoutComponent` wraps the authenticated pages and hosts the main nav + header.
- **Outlets**: dashboard children are nested under `/dashboard/*` with route-level code splitting.

### State management (Signals + service stores)

This project uses **Angular signals** in injectable services as lightweight client-side stores:

- **`TaskStoreService`**: holds tasks in a `signal<Task[]>`, exposes read-only signals, and wraps API calls (`refresh`, `upsert`, `remove`, `updateTaskStatus`).
- **`TeamStoreService`**: holds team members in a `signal<Assignee[]>` and loads/adds users.
- **`AuthService`**: stores token/user in signals, persists to `localStorage`, exposes computed selectors like `isAuthenticated` and `displayInitials`.

This keeps state colocated with domain logic, avoids boilerplate, and plays well with the standalone/lazy architecture.

### Cross-cutting concerns (Core providers + interceptor)

- **Central provider bundle**: `provideCore()` wires up `HttpClient` + interceptors and i18n providers.
- **HTTP interceptor**: adds `X-Request-Id` to every request and attaches `Authorization: Bearer <token>` when authenticated.
- **i18n**: translations are loaded from `public/i18n/*.json` and exposed via a `TranslatePipe`.

## Testing strategy

Unit tests live alongside components as `*.spec.ts` and run via:

```bash
npm test
```

Testing approach:

- **Component-level unit tests**: validate template rendering and interactions.
- **Service mocking**: `src/testing/test-utils.ts` provides lightweight mocks for `AuthService`, `TaskStoreService`, `TeamStoreService`, and `TranslationService` to keep tests fast and deterministic.
- **Signals-friendly fixtures**: fixtures return signals/computed values so components behave similarly to production.

## Performance optimization techniques used

- **Route-level code splitting** via `loadComponent` in `src/app/app.routes.ts` to reduce initial JS.
- **Async animations provider** (`provideAnimationsAsync`) to avoid blocking startup.
- **Signal-based stores** to minimize unnecessary observable plumbing and keep updates localized.
- **Template iteration with `@for (...; track ...)`** in key nav/page lists to reduce DOM churn.
- **Production build budgets + output hashing** configured in `angular.json`.

## Known limitations and future improvements

- **No real persistence layer**: server uses JSON files; multi-user concurrency and data integrity are not guaranteed.
- **Auth is demo-grade**: JWT is issued, but the API doesn’t enforce auth on all endpoints; add middleware to protect routes.
- **Error handling & UX**: add unified toast/notification handling and richer empty/error states for API failures.
- **E2E coverage**: add end-to-end tests (e.g., Playwright/Cypress) for the full login + task flows.
- **Accessibility pass**: verify keyboard navigation, focus management, and ARIA semantics across pages.
- **Configurable environments**: add Angular environment files (dev/prod) if deploying to different API origins without the dev proxy.