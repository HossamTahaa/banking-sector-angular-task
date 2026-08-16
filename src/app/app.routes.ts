import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('@pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'customers/:cif/accounts/:accountId/transactions/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@pages/transaction-create/transaction-create.component').then(
        (m) => m.TransactionCreateComponent,
      ),
  },
  {
    path: 'customers/:cif/accounts/:accountId/transactions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@pages/transactions/transactions.component').then((m) => m.TransactionsComponent),
  },
  {
    path: 'customers/:cif',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@pages/customer-details/customer-details.component').then(
        (m) => m.CustomerDetailsComponent,
      ),
  },
  { path: '**', redirectTo: 'dashboard' },
];
