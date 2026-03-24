import { Routes } from '@angular/router';

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
            loadComponent: loadDashboardPage,
            data: { title: 'Dashboard' },
          },
          { path: 'tasks', loadComponent: loadTasksPage, data: { title: 'Tasks' } },
          { path: 'calendar', loadComponent: loadShellOutlet },
          { path: 'analytics', loadComponent: loadShellOutlet },
          { path: 'team', loadComponent: loadTeamPage, data: { title: 'Team' } },
          { path: 'settings', loadComponent: loadShellOutlet },
        ],
      },
    ],
  },
];
