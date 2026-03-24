export { provideCore } from './core.providers';
export { AuthService } from './auth/auth.service';
export { authGuard } from './auth/auth.guard';
export { guestGuard } from './auth/guest.guard';
export * from './interceptors';
export * from './i18n';
export {
  DashboardLayoutComponent,
  type DashboardSideNavIcon,
  type DashboardSideNavItem,
} from './dashboard-layout/dashboard-layout';
