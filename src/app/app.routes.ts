import { Routes } from '@angular/router';

import { authGuard } from '../core/auth/auth.guard';
import { guestGuard } from '../core/auth/guest.guard';

const loadLogin = () =>
  import('../core/auth/login.component').then((m) => m.LoginComponent);

const loadDashboardLayout = () =>
  import('../core/dashboard-layout/dashboard-layout').then((m) => m.DashboardLayoutComponent);

const loadDashboardOutlet = () =>
  import('./dashboard-outlet.component').then((m) => m.DashboardOutletComponent);

const loadShellOutlet = () =>
  import('./shell-outlet.component').then((m) => m.ShellOutletComponent);

const loadDashboardPage = () =>
  import('../features/dashboard/dashboard').then((m) => m.DashboardComponent);

const loadTasksPage = () =>
  import('@features/tasks/tasks-page.component').then((m) => m.TasksPageComponent);

const loadTeamPage = () =>
  import('@features/team/team-page.component').then((m) => m.TeamPageComponent);

const loadTaskSearchPage = () =>
  import('@features/task-search/task-search-page.component').then((m) => m.TaskSearchPageComponent);

const loadMobileMorePage = () =>
  import('@features/mobile-more/mobile-more-page.component').then((m) => m.MobileMorePageComponent);

const loadAnalyticsPage = () =>
  import('@features/analytics/analytics-page.component').then((m) => m.AnalyticsPageComponent);

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: loadLogin,
    canActivate: [guestGuard],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: loadDashboardLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: loadDashboardOutlet,
        children: [
          {
            path: '',
            loadComponent: loadDashboardPage,
            data: { title: 'Dashboard' },
          },
          { path: 'tasks', loadComponent: loadTasksPage, data: { title: 'Tasks' } },
          { path: 'search', loadComponent: loadTaskSearchPage, data: { title: 'Search' } },
          { path: 'more', loadComponent: loadMobileMorePage, data: { title: 'More' } },
          { path: 'calendar', loadComponent: loadShellOutlet },
          { path: 'analytics', loadComponent: loadAnalyticsPage, data: { title: 'Analytics' } },
          { path: 'team', loadComponent: loadTeamPage, data: { title: 'Team' } },
          { path: 'settings', loadComponent: loadShellOutlet },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
