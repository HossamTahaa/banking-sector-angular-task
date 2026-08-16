# Banking Portal

An Angular front-end for a core banking console — customer and account management, transaction history, and monthly insights. Built as a technical task with Angular 22, standalone components and signals.

The app runs entirely on mock data (static JSON + `localStorage`), so there is no backend to set up.

## Screenshots

| Sign in | Customers |
<img width="529" height="448" alt="image" src="https://github.com/user-attachments/assets/a54479e9-93ee-43ce-8d6e-b074e0debdc8" />
<img width="1912" height="524" alt="image" src="https://github.com/user-attachments/assets/a551972c-2cf5-4d7e-8108-24a06a86e7a6" />



| Customer details | Account transactions |
| --- | --- |
<img width="1919" height="464" alt="image" src="https://github.com/user-attachments/assets/e4bd76fa-bb57-4227-8cb8-a678a4ee331b" />
<img width="1902" height="685" alt="image" src="https://github.com/user-attachments/assets/56ea82b0-ab3b-420a-a14f-cd2b7d6d0b43" />


| New transaction | Monthly insights |
| --- | --- |
<img width="610" height="453" alt="image" src="https://github.com/user-attachments/assets/c828ce07-ca69-4c57-8799-e6af294daa59" />


## Getting started

**Requirements:** Node.js `^22.22.3`, `^24.15.0`, or `>=26.0.0` (developed on Node 24.18, npm 11.16).

### 1. Get the code

```bash
git clone https://github.com/HossamTahaa/banking-sector-angular-task.git
cd banking-sector-angular-task
```

Or download the ZIP from the repository page (**Code → Download ZIP**) and extract it.

### 2. Install and run

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

### 3. Sign in

There is no real authentication. Any credentials that pass validation are accepted:

- **Email** — any valid address, e.g. `staff@bank.com`
- **Password** — at least 8 characters

Sign-in stores a mock token in `localStorage` and redirects to the dashboard.

### Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Dev server at `http://localhost:4200/` |
| `npm run build` | Production build into `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Verify formatting without writing |

## Features

**Authentication** — reactive sign-in form with per-field validation, a mock `AuthService` returning a delayed observable, and route guards. `authGuard` sends signed-out users to `/login`; `guestGuard` keeps signed-in users off it.

**Customers** — searchable list, drilling into a customer's profile and their accounts.

**Transactions** — per-account history with filtering by date range, type and category; sortable, paginated table; a "Recent transactions" mini statement with a configurable size; and CSV export of the currently filtered rows.

**Monthly insights** — per-month totals for credit, debit and net, plus the top spending category (debits only), with a month selector listing only months that have activity.

**Create transaction** — validated form that adjusts the account balance immediately (debits subtract, credits add) and persists, so new entries survive a refresh.

## Mock data

All data lives in `src/assets/mock/`:

| File | Read by | Notes |
| --- | --- | --- |
| `customers.json` | `CustomerService` | re-read on every load |
| `accounts.json` | `AccountService` | **seed only** — see below |
| `transactions.json` | `TransactionService` | **seed only** — see below |
| `transaction-types.json` | `TransactionService` | Debit / Credit lookup |
| `transaction-categories.json` | `TransactionService` | category dropdowns |

`TransactionStoreService` is the single source of truth for transactions and balances at runtime. It seeds from `accounts.json` and `transactions.json` **once**, then treats `localStorage` as authoritative so added transactions survive a refresh.

> **Editing `accounts.json` or `transactions.json` has no effect after the first run.** Clear the stored copy to re-seed:
>
> ```js
> localStorage.removeItem('bank_transactions');
> localStorage.removeItem('bank_balances');
> location.reload();
> ```

Relationships are matched on exact strings: an account's `customerId` must equal a customer's `cif`, and a transaction's `accountId` must equal an account's `id`. Dates are `YYYY-MM-DD` — the month grouping and range filter both rely on that format.

## Project structure

```
src/app/
├── core/                        # singletons
│   ├── guards/                  # authGuard, guestGuard
│   ├── models/                  # Customer, Account, Transaction, MonthlySummary
│   └── services/                # Api, Auth, LocalStorage, Toastr, Export,
│                                # Customer, Account, Transaction, TransactionStore
├── layouts/
│   ├── main-layout/             # header + side menu + content (authenticated)
│   ├── blank-layout/            # centred, chrome-free (login)
│   └── components/              # header, side-menu
├── pages/
│   ├── login/
│   ├── dashboard/               # customer list
│   ├── customer-details/        # profile + accounts
│   ├── transactions/            # per-account history, insights, export
│   └── transaction-create/
└── shared/
    ├── components/              # transactions-table (presentational)
    └── validators/              # amount, merchant, not-future-date,
                                 # debit-not-exceed-balance
```

### Routes

| Path | Guard | Screen |
| --- | --- | --- |
| `/` | — | redirects to `/login` |
| `/login` | `guestGuard` | sign in |
| `/dashboard` | `authGuard` | customer list |
| `/customers/:cif` | `authGuard` | customer details |
| `/customers/:cif/accounts/:accountId/transactions` | `authGuard` | account transactions |
| `/customers/:cif/accounts/:accountId/transactions/new` | `authGuard` | create transaction |
| `**` | — | redirects to `/dashboard` |

Every route is lazy loaded with `loadComponent()`.

## Architecture notes

**Signals for state, RxJS for streams.** `TransactionStoreService` holds state in signals and exposes read-only views plus per-account selectors. Components derive with `computed()`. RxJS is used where it fits — combining the filter form's `valueChanges` with the store's transactions via `combineLatest`.

**Only the store touches `localStorage`.** Components never read or write it directly, so persistence is one file's concern.

**Presentational components stay dumb.** `TransactionsTableComponent` takes a list as an `input()` and emits a row click — no store access, no data loading.

**Custom validators are pure functions.** Each lives in its own file under `shared/validators/`. The cross-field debit rule takes the balance as a `Signal<number>` so it follows the store rather than a value captured when the form was built.

**Route params as typed inputs.** `withComponentInputBinding()` is enabled, so pages receive `cif` and `accountId` via `input.required<string>()` instead of injecting `ActivatedRoute`.

**Path aliases over relative imports.** `@core/*`, `@shared/*`, `@layouts/*`, `@pages/*` and `@env/*` are mapped in `tsconfig.json`.

**Strict everywhere.** `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `strictTemplates` are all on. No `any` in the codebase.

**A thin `ApiService`.** Wraps `HttpClient` and prefixes `environment.apiUrl`, which currently points at `assets/mock`. Pointing at a real backend is a one-line change.

## Testing

```bash
npm test
```

36 tests across 4 files (Vitest + jsdom, zoneless):

| Suite | Covers |
| --- | --- |
| `transactions.component.spec.ts` | account isolation, filters, date ranges, mini statement, CSV export, detail dialog, monthly insights |
| `transaction-create.component.spec.ts` | validation, the debit-exceeds-balance rule, balance adjustment, persistence |
| `transactions-table.component.spec.ts` | pagination, row-click output, empty state |
| `app.component.spec.ts` | bootstrap |

## Tech stack

Angular 22 · TypeScript 6 · PrimeNG 22 (Aura theme) · RxJS 7 · Vitest · ESLint + Prettier
