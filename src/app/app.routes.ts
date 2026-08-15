import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('@pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
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
