# Banking Portal

Angular front-end technical task for a banking sector application, built with Angular 22 and TypeScript.

## Project status

The application foundation is complete: routing, authentication, layouts, HTTP layer, domain models and tooling are all in place and working. The feature screens are currently rendered as placeholders — see [Roadmap](#roadmap) for what is intentionally left open.

| Area | Status |
| --- | --- |
| Routing + lazy loading | ✅ Done |
| Route guard / auth redirect | ✅ Done |
| Auth service (token, signals, persistence) | ✅ Done |
| HTTP API layer | ✅ Done |
| Domain models (Customer, Account, Transaction) | ✅ Done |
| App shell (header, side menu, layouts) | ✅ Done |
| Toast notifications | ✅ Done |
| Lint / format / strict TypeScript | ✅ Done |
| Login form + validation | 🚧 Placeholder |
| Dashboard widgets | 🚧 Placeholder |
| Customer details view | 🚧 Placeholder |

## Tech stack

- **Angular 22** — standalone components, signals, new control flow
- **TypeScript 6** — `strict` mode with additional safety flags enabled
- **PrimeNG 22** + Aura theme — UI component library
- **RxJS 7** — HTTP streams
- **ESLint + Prettier** — linting and formatting
- **Vitest** — unit test runner

## Getting started

**Requirements:** Node.js `^22.22.3`, `^24.15.0`, or `>=26.0.0`

```bash
npm install
npm start
```

The app runs at `http://localhost:4200/`.

### Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the dev server with HMR |
| `npm run build` | Production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Verify formatting without writing |

### Configuration

The API base URL lives in the environment files — no secrets are committed.

| File | `apiUrl` |
| --- | --- |
| `src/environments/environment.development.ts` | `http://localhost:3000/api` |
| `src/environments/environment.ts` | `/api` |

## Project structure

```
src/app/
├── core/                  # singletons — imported once, never duplicated
│   ├── guards/            # authGuard
│   ├── models/            # Customer, Account, Transaction
│   └── services/          # Api, Auth, LocalStorage, Toastr
├── layouts/
│   ├── main-layout/       # header + side menu + content (authenticated)
│   ├── blank-layout/      # centred, chrome-free (login)
│   └── components/        # header, side-menu
├── pages/                 # routed feature screens
│   ├── login/
│   ├── dashboard/
│   └── customer-details/
└── shared/                # reusable components and validators
```

### Routes

| Path | Guard | Component |
| --- | --- | --- |
| `/` | — | redirects to `/login` |
| `/login` | — | `LoginComponent` |
| `/dashboard` | `authGuard` | `DashboardComponent` |
| `/customers/:cif` | `authGuard` | `CustomerDetailsComponent` |
| `**` | — | redirects to `/dashboard` |

## Architecture notes

A few decisions worth calling out:

**Path aliases over relative imports.** `@core/*`, `@shared/*`, `@layouts/*`, `@pages/*` and `@env/*` are mapped in `tsconfig.json`, so imports stay readable and files can move without rewriting `../../../` chains.

**Every route is lazy loaded.** Routes use `loadComponent()` rather than eager imports, so each screen ships as its own chunk and the initial bundle stays small — this matters on the low-bandwidth connections common in retail banking branches.

**Auth state is a signal, not a subject.** `AuthService` holds the token in a `signal` and exposes `isAuthenticated` as a `computed`. The guard reads it synchronously, so there is no subscription to manage and no chance of a stale value during navigation.

**The guard redirects, it does not block.** `authGuard` returns a `UrlTree` to `/login` carrying a `returnUrl` query param, rather than returning `false`. The user lands back where they intended after signing in.

**Component input binding for route params.** `withComponentInputBinding()` is enabled, so `CustomerDetailsComponent` receives `cif` via `input.required<string>()` instead of injecting `ActivatedRoute` — less boilerplate and the input is typed.

**A thin `ApiService` wrapper.** Generic `get`/`post`/`put`/`delete` over `HttpClient` that prefixes `environment.apiUrl`. Features never hardcode a base URL, so pointing at a different backend is a one-line change.

**Toasts behind an interface.** `ToastrService` wraps PrimeNG's `MessageService` with `success`/`info`/`error`. Swapping the toast library later touches one file.

**Explicit dark mode.** PrimeNG's theme uses `darkModeSelector: '.dark'` instead of the OS preference, so the theme only changes when the app asks it to.

**Strict everywhere.** `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `strictTemplates` are all on.

## Roadmap

What I would build next, in order:

1. **Login form** — reactive form with validation, wired to `AuthService.login()`, error handling via `ToastrService`
2. **HTTP interceptor** — attach the bearer token to outgoing requests and redirect to `/login` on `401`
3. **Customer list** — a `/customers` route with search, filtering and pagination (the side menu already links to it)
4. **Dashboard** — account summary cards and recent transactions
5. **Customer details** — profile, linked accounts and a transaction table for `/customers/:cif`
6. **Tests** — unit coverage for the guard and services, component tests for the forms
7. **i18n + RTL** — Arabic locale support, which a banking product in this region needs
