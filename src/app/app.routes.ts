import { Routes } from '@angular/router';

const loadDashboardLayout = () =>
  import('../core/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayoutComponent);

const loadDashboardOutlet = () =>
  import('./dashboard-outlet.component').then((m) => m.DashboardOutletComponent);

const loadShellOutlet = () =>
  import('./shell-outlet.component').then((m) => m.ShellOutletComponent);

export const routes: Routes = [
  {
    path: '',
    loadComponent: loadDashboardLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: loadDashboardOutlet,
        children: [
          {
            path: '',
            loadComponent: loadShellOutlet,
            data: { title: 'Dashboard' },
          },
          { path: 'tasks', loadComponent: loadShellOutlet },
          { path: 'calendar', loadComponent: loadShellOutlet },
          { path: 'analytics', loadComponent: loadShellOutlet },
          { path: 'team', loadComponent: loadShellOutlet },
          { path: 'settings', loadComponent: loadShellOutlet },
        ],
      },
    ],
  },
];
