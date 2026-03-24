export type DashboardSideNavIcon =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'analytics'
  | 'team'
  | 'settings';

export interface DashboardSideNavItem {
  labelKey: string;
  route: string;
  icon: DashboardSideNavIcon;
  exact?: boolean;
}

export const DASHBOARD_SIDE_NAV_ITEMS: readonly DashboardSideNavItem[] = [
  { labelKey: 'sidebar.dashboard', route: '/dashboard', icon: 'dashboard', exact: true },
  { labelKey: 'sidebar.tasks', route: '/dashboard/tasks', icon: 'tasks' },
  { labelKey: 'sidebar.calendar', route: '/dashboard/calendar', icon: 'calendar' },
  { labelKey: 'sidebar.analytics', route: '/dashboard/analytics', icon: 'analytics' },
  { labelKey: 'sidebar.team', route: '/dashboard/team', icon: 'team' },
  { labelKey: 'sidebar.settings', route: '/dashboard/settings', icon: 'settings' },
];

/** Items shown on the mobile “More” sheet (excludes dashboard & tasks — those are in the bottom bar). */
export const DASHBOARD_MORE_MENU_ITEMS: readonly DashboardSideNavItem[] =
  DASHBOARD_SIDE_NAV_ITEMS.filter(
    (i) => i.route !== '/dashboard' && i.route !== '/dashboard/tasks',
  );
